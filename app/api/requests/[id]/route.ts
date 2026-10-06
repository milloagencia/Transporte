import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { accountBlock } from "@/lib/guards"
import { buildRequestData } from "@/lib/trip-input"
import { validationResponse } from "@/lib/api-errors"

const OWNER_STATUSES = ["open", "cancelled"]

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const request = await db.tripRequest.findUnique({
    where: { id },
    include: { requester: { select: { id: true, name: true } } },
  })
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(request)
}

/** Edit a request: the merged result is validated with the same rules as a new request. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const userId = (session.user as { id: string }).id
  const blocked = accountBlock({ status: (session.user as { status?: string }).status ?? "active" }, "basic")
  if (blocked) return blocked
  const existing = await db.tripRequest.findUnique({ where: { id } })
  if (!existing || existing.requesterId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (existing.status !== "open") return NextResponse.json({ error: "request_closed" }, { status: 400 })
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>

  if (body.status !== undefined && !OWNER_STATUSES.includes(String(body.status))) {
    return NextResponse.json({ error: "invalid_option" }, { status: 400 })
  }
  // Cancelling only changes the status
  if (body.status === "cancelled") {
    return NextResponse.json(await db.tripRequest.update({ where: { id }, data: { status: "cancelled" } }))
  }

  const datesChanged = body.windowFrom !== undefined || body.windowTo !== undefined
  const merged = {
    ...existing,
    windowFrom: existing.windowFrom.toISOString(),
    windowTo: existing.windowTo.toISOString(),
    ...body,
  }
  let data
  try {
    data = buildRequestData(merged, { allowPast: !datesChanged })
  } catch (e) {
    return validationResponse(e)
  }
  return NextResponse.json(await db.tripRequest.update({ where: { id }, data }))
}

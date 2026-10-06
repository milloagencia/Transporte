import { NextResponse, after } from "next/server"
import { notifyRequestAlerts } from "@/lib/alerts"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { accountBlock, ACTIVE_OWNER } from "@/lib/guards"
import { buildRequestData } from "@/lib/trip-input"
import { validationResponse } from "@/lib/api-errors"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const requests = await db.tripRequest.findMany({
    where: { status: "open", windowTo: { gte: new Date() }, requester: ACTIVE_OWNER },
    include: { requester: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(requests)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const blocked = accountBlock({ status: (session.user as { status?: string }).status ?? "active" }, "create")
  if (blocked) return blocked
  const body = await req.json().catch(() => ({}))
  let data
  try {
    data = buildRequestData(body)
  } catch (e) {
    return validationResponse(e)
  }
  const request = await db.tripRequest.create({ data: { ...data, requesterId: userId } })
  // Email matching alerts after responding, so posting stays fast
  after(() => notifyRequestAlerts(request).catch((e) => console.error("[alerts]", e)))
  return NextResponse.json(request, { status: 201 })
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getRequestUser, unauthorized } from "@/lib/mobile-auth"
import { publishLocationUpdate } from "@/lib/live-updates"
import { isApprovedDriver, accountBlock } from "@/lib/guards"
import { rateLimited } from "@/lib/rate-limit"

export const runtime = "nodejs"

const TRANSITIONS: Record<string, string[]> = {
  accepted: ["on_the_way"],
  on_the_way: ["arrived"],
  arrived: ["in_trip"],
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getRequestUser(request)
  if (!me) return unauthorized()
  const blocked = accountBlock(me, "basic")
  if (blocked) return blocked
  const { id } = await params
  if (rateLimited(`trip-status:${me.id}:${id}`, 10, 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }
  const body = await request.json().catch(() => null)
  const nextStatus = body?.status
  if (!["on_the_way", "arrived", "in_trip"].includes(nextStatus)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 })
  }
  const deal = await db.deal.findUnique({
    where: { id },
    select: { id: true, driverId: true, status: true, operationalStatus: true },
  })
  if (!deal || deal.driverId !== me.id) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (me.status !== "active" || deal.status !== "paid_escrow" ||
      !TRANSITIONS[deal.operationalStatus]?.includes(nextStatus) ||
      !(await isApprovedDriver(me.id))) {
    return NextResponse.json({ error: "trip_status_not_allowed" }, { status: 403 })
  }
  const updated = await db.deal.updateMany({
    where: { id, driverId: me.id, status: "paid_escrow", operationalStatus: deal.operationalStatus },
    data: { operationalStatus: nextStatus },
  })
  if (updated.count !== 1) return NextResponse.json({ error: "trip_status_changed" }, { status: 409 })
  await publishLocationUpdate(id, { dealId: id, operationalStatus: nextStatus })
  return NextResponse.json({ operationalStatus: nextStatus }, { headers: { "Cache-Control": "no-store" } })
}

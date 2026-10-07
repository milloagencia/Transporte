import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getRequestUser, unauthorized } from "@/lib/mobile-auth"
import { publishLocationUpdate } from "@/lib/live-updates"
import { isApprovedDriver, accountBlock } from "@/lib/guards"
import { rateLimited } from "@/lib/rate-limit"

export const runtime = "nodejs"

const LIVE_STATUSES = ["on_the_way", "arrived", "in_trip"] as const

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getRequestUser(request)
  if (!me) return unauthorized()
  const { id } = await params
  const deal = await db.deal.findUnique({ where: { id } })
  if (!deal || deal.status !== "paid_escrow" ||
      (deal.driverId !== me.id && deal.requesterId !== me.id && me.role !== "admin")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (!LIVE_STATUSES.includes(deal.operationalStatus as (typeof LIVE_STATUSES)[number])) {
    return NextResponse.json({ location: null, operationalStatus: deal.operationalStatus }, { headers: { "Cache-Control": "no-store" } })
  }
  const location = await db.driverLocation.findFirst({
    where: { dealId: id, driverId: deal.driverId },
    orderBy: { createdAt: "desc" },
    select: { latitude: true, longitude: true, accuracyM: true, createdAt: true },
  })
  return NextResponse.json(
    { location, operationalStatus: deal.operationalStatus },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getRequestUser(request)
  if (!me) return unauthorized()
  const blocked = accountBlock(me, "basic")
  if (blocked) return blocked
  const { id } = await params
  if (rateLimited(`location:${me.id}:${id}`, 30, 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }
  const body = await request.json().catch(() => null)
  const latitude = body?.latitude
  const longitude = body?.longitude
  const accuracyM = body?.accuracyM
  if (typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
      (accuracyM !== undefined && (typeof accuracyM !== "number" || !Number.isFinite(accuracyM) || accuracyM < 0 || accuracyM > 1000))) {
    return NextResponse.json({ error: "invalid_location" }, { status: 400 })
  }

  const deal = await db.deal.findUnique({ where: { id }, select: { id: true, driverId: true, status: true, operationalStatus: true } })
  if (!deal || deal.driverId !== me.id) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (me.status !== "active" || deal.status !== "paid_escrow" ||
      !LIVE_STATUSES.includes(deal.operationalStatus as (typeof LIVE_STATUSES)[number]) ||
      !(await isApprovedDriver(me.id))) {
    return NextResponse.json({ error: "trip_tracking_not_allowed" }, { status: 403 })
  }

  const location = await db.driverLocation.create({
    data: { dealId: id, driverId: me.id, latitude, longitude, accuracyM: accuracyM ?? null },
    select: { latitude: true, longitude: true, accuracyM: true, createdAt: true },
  })
  await publishLocationUpdate(id, { dealId: id, location })
  return NextResponse.json({ ok: true, location }, { status: 201, headers: { "Cache-Control": "no-store" } })
}

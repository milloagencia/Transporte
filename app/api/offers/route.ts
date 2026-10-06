import { NextResponse, after } from "next/server"
import { notifyOfferAlerts } from "@/lib/alerts"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { isApprovedDriver, accountBlock, ACTIVE_OWNER } from "@/lib/guards"
import { buildOfferData } from "@/lib/trip-input"
import { validationResponse } from "@/lib/api-errors"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const offers = await db.tripOffer.findMany({
    where: { status: "active", startWindowTo: { gte: new Date() }, driver: ACTIVE_OWNER },
    include: { driver: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(offers)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const blocked = accountBlock({ status: (session.user as { status?: string }).status ?? "active" }, "create")
  if (blocked) return blocked
  if (!(await isApprovedDriver(userId))) {
    return NextResponse.json({ error: "driver_not_verified" }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const vehicle = body.vehicleId
    ? await db.vehicle.findUnique({ where: { id: String(body.vehicleId) } })
    : null
  if (!vehicle || vehicle.ownerId !== userId || !vehicle.active) {
    return NextResponse.json({ error: "vehicle_required" }, { status: 400 })
  }
  let data
  try {
    data = buildOfferData(body, vehicle)
  } catch (e) {
    return validationResponse(e)
  }
  const offer = await db.tripOffer.create({
    data: {
      ...data,
      driverId: userId,
      maxDetourMiles: 20,
      pickupRadiusMiles: 10,
    },
  })
  // Email matching alerts after responding, so posting stays fast
  after(() => notifyOfferAlerts(offer).catch((e) => console.error("[alerts]", e)))
  return NextResponse.json(offer, { status: 201 })
}

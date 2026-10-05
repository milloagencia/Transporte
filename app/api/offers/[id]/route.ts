import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { accountBlock } from "@/lib/guards"
import { buildOfferData } from "@/lib/trip-input"
import { validationResponse } from "@/lib/api-errors"

const OWNER_STATUSES = ["active", "paused"]

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const offer = await db.tripOffer.findUnique({
    where: { id },
    include: { driver: { select: { id: true, name: true } } },
  })
  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(offer)
}

/** Edit an offer: the merged result is validated with the same rules as a new offer. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const userId = (session.user as { id: string }).id
  const blocked = accountBlock({ status: (session.user as { status?: string }).status ?? "active" }, "basic")
  if (blocked) return blocked
  const offer = await db.tripOffer.findUnique({ where: { id } })
  if (!offer || offer.driverId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (offer.status === "cancelled" || offer.status === "completed") {
    return NextResponse.json({ error: "offer_closed" }, { status: 400 })
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>

  if (body.status !== undefined && !OWNER_STATUSES.includes(String(body.status))) {
    return NextResponse.json({ error: "invalid_option" }, { status: 400 })
  }

  const vehicleId = (body.vehicleId as string | undefined) ?? offer.vehicleId
  const vehicle = vehicleId ? await db.vehicle.findUnique({ where: { id: vehicleId } }) : null
  if (!vehicle || vehicle.ownerId !== userId) return NextResponse.json({ error: "vehicle_required" }, { status: 400 })

  const datesChanged = body.startWindowFrom !== undefined || body.startWindowTo !== undefined
  const merged = {
    originCity: offer.originCity, originState: offer.originState, originZip: offer.originZip,
    destCity: offer.destCity, destState: offer.destState, destZip: offer.destZip,
    startWindowFrom: offer.startWindowFrom.toISOString(), startWindowTo: offer.startWindowTo.toISOString(),
    serviceType: offer.serviceType, exclusivity: offer.exclusivity, proposedRate: offer.proposedRate,
    seats: offer.seats, cargoWeightLbs: offer.cargoWeightLbs,
    ...body,
  }
  let data
  try {
    // Past dates are only rejected when the driver changes them
    data = buildOfferData(merged, vehicle, { allowPast: !datesChanged })
  } catch (e) {
    return validationResponse(e)
  }
  const status = body.status as "active" | "paused" | undefined
  return NextResponse.json(await db.tripOffer.update({ where: { id }, data: { ...data, ...(status ? { status } : {}) } }))
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const userId = (session.user as { id: string }).id
  const blocked = accountBlock({ status: (session.user as { status?: string }).status ?? "active" }, "basic")
  if (blocked) return blocked
  const offer = await db.tripOffer.findUnique({ where: { id } })
  if (!offer || offer.driverId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await db.tripOffer.update({ where: { id }, data: { status: "cancelled" } })
  return NextResponse.json({ ok: true })
}

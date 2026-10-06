import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/guards"
import { US_STATES } from "@/lib/validation"

const MAX_ACTIVE = 20
const str = (v: unknown, max = 80) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null)
const num = (v: unknown, min: number, max: number) => {
  const n = Number(v)
  return v != null && v !== "" && Number.isFinite(n) && n >= min && n <= max ? n : null
}
const date = (v: unknown, endOfDay = false) => {
  if (typeof v !== "string" || !v) return null
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T${endOfDay ? "23:59:59" : "00:00:00"}-05:00` : v)
  return isNaN(d.getTime()) ? null : d
}
const state = (v: unknown) => (typeof v === "string" && US_STATES.includes(v.toUpperCase()) ? v.toUpperCase() : null)

/** Create an email alert: from one of my requests ({ requestId }) or from board filters ({ kind, ... }). */
export async function POST(req: Request) {
  const { me, error } = await requireUser("basic")
  if (error) return error
  const body = await req.json().catch(() => ({}))
  if ((await db.tripAlert.count({ where: { userId: me.id, active: true } })) >= MAX_ACTIVE) {
    return NextResponse.json({ error: "alert_limit" }, { status: 400 })
  }

  if (body.requestId) {
    const r = await db.tripRequest.findUnique({ where: { id: String(body.requestId) } })
    if (!r || r.requesterId !== me.id) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const existing = await db.tripAlert.findFirst({ where: { requestId: r.id, active: true } })
    if (existing) return NextResponse.json(existing)
    const alert = await db.tripAlert.create({
      data: {
        userId: me.id, kind: "offers", requestId: r.id,
        originCity: r.originCity, originState: r.originState, destCity: r.destCity, destState: r.destState, radiusMiles: 25,
        dateFrom: r.windowFrom, dateTo: r.windowTo, serviceType: r.serviceType,
        passengers: r.passengerCount, cargoWeightLbs: r.cargoWeightLbs,
        cargoLengthIn: r.cargoLengthIn, cargoWidthIn: r.cargoWidthIn, cargoHeightIn: r.cargoHeightIn, coldChain: r.coldChainRequired,
      },
    })
    return NextResponse.json(alert, { status: 201 })
  }

  const kind = body.kind === "requests" ? "requests" : "offers"
  const data = {
    userId: me.id, kind,
    originCity: str(body.originCity), originState: state(body.originState),
    destCity: str(body.destCity), destState: state(body.destState),
    radiusMiles: num(body.radiusMiles, 0, 500) ?? 0,
    dateFrom: date(body.dateFrom), dateTo: date(body.dateTo, true),
    serviceType: ["people", "cargo", "mixed"].includes(body.serviceType) ? body.serviceType : null,
    passengers: num(body.passengers, 1, 60), cargoWeightLbs: num(body.cargoWeightLbs, 1, 80000),
    coldChain: ["cooler_ice", "active_refrigeration"].includes(body.coldChain) ? body.coldChain : "none",
    vehicleId: null as string | null,
  }
  if (!data.originCity && !data.destCity && !data.originState && !data.destState) {
    return NextResponse.json({ error: "alert_empty" }, { status: 400 })
  }
  if (kind === "requests" && typeof body.vehicleId === "string" && body.vehicleId) {
    const v = await db.vehicle.findUnique({ where: { id: body.vehicleId } })
    if (v && v.ownerId === me.id) data.vehicleId = v.id
  }
  // Alerts without an end date expire after 60 days
  if (!data.dateTo) data.dateTo = new Date(Date.now() + 60 * 24 * 3600 * 1000)
  const alert = await db.tripAlert.create({ data })
  return NextResponse.json(alert, { status: 201 })
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUser, accountBlock } from "@/lib/guards"
import { parseVehicleInput } from "@/lib/vehicle-input"

export async function GET() {
  const me = await getSessionUser()
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const vehicles = await db.vehicle.findMany({ where: { ownerId: me.id, active: true }, orderBy: { createdAt: "desc" } })
  return NextResponse.json(vehicles)
}

export async function POST(req: Request) {
  const me = await getSessionUser()
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const blocked = accountBlock(me, "create")
  if (blocked) return blocked
  const parsed = parseVehicleInput(await req.json().catch(() => ({})))
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  if (parsed.data.vehicleModelId) {
    const exists = await db.vehicleModel.findUnique({ where: { id: parsed.data.vehicleModelId } })
    if (!exists) parsed.data.vehicleModelId = null
  }
  const vehicle = await db.vehicle.create({ data: { ...parsed.data, ownerId: me.id } })
  return NextResponse.json(vehicle, { status: 201 })
}

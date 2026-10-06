import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/guards"

/** Removes a vehicle from the driver's list (kept in the database for past offers). */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser()
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const vehicle = await db.vehicle.findUnique({ where: { id } })
  if (!vehicle || vehicle.ownerId !== me.id) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await db.vehicle.update({ where: { id }, data: { active: false } })
  return NextResponse.json({ ok: true })
}

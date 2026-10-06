import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logAdmin, requireAdmin } from "@/lib/guards"

/** Admin: cancel (hide) or reactivate a offer. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me, error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const item = await db.tripOffer.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (body.action !== "cancel" && body.action !== "reactivate") return NextResponse.json({ error: "invalid_option" }, { status: 400 })
  await db.tripOffer.update({ where: { id }, data: { status: body.action === "cancel" ? "cancelled" : "active" } })
  await logAdmin(me.id, `offer.${body.action}`, "offer", id, typeof body.reason === "string" ? body.reason : null)
  return NextResponse.json({ ok: true })
}

/** Admin: delete a offer permanently (only if no deal uses it; otherwise cancel it). */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me, error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const deals = await db.deal.count({ where: { tripOfferId: id } })
  if (deals > 0) return NextResponse.json({ error: "has_deals" }, { status: 400 })
  await db.tripOffer.delete({ where: { id } })
  await logAdmin(me.id, "offer.delete", "offer", id)
  return NextResponse.json({ ok: true })
}

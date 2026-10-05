import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logAdmin, requireAdmin } from "@/lib/guards"

/** Admin: cancel (hide) or reactivate a request. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me, error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const item = await db.tripRequest.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (body.action !== "cancel" && body.action !== "reactivate") return NextResponse.json({ error: "invalid_option" }, { status: 400 })
  await db.tripRequest.update({ where: { id }, data: { status: body.action === "cancel" ? "cancelled" : "open" } })
  await logAdmin(me.id, `request.${body.action}`, "request", id, typeof body.reason === "string" ? body.reason : null)
  return NextResponse.json({ ok: true })
}

/** Admin: delete a request permanently (only if no deal uses it; otherwise cancel it). */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me, error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const deals = await db.deal.count({ where: { tripRequestId: id } })
  if (deals > 0) return NextResponse.json({ error: "has_deals" }, { status: 400 })
  await db.tripRequest.delete({ where: { id } })
  await logAdmin(me.id, "request.delete", "request", id)
  return NextResponse.json({ ok: true })
}

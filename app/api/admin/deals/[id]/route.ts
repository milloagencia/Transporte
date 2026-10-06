import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logAdmin, requireAdmin } from "@/lib/guards"

/** Admin: cancel any deal that is not finished (refunds the simulated payment, no penalty). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me, error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : null
  const deal = await db.deal.findUnique({ where: { id }, include: { payment: true, cancellation: true } })
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (body.action !== "cancel") return NextResponse.json({ error: "invalid_option" }, { status: 400 })
  if (deal.status === "completed" || deal.status === "cancelled") return NextResponse.json({ error: "deal_closed" }, { status: 400 })

  await db.$transaction([
    db.deal.update({ where: { id }, data: { status: "cancelled" } }),
    ...(deal.payment ? [db.payment.update({ where: { dealId: id }, data: { status: "simulated_refunded" } })] : []),
    ...(deal.cancellation ? [] : [db.cancellation.create({ data: { dealId: id, cancelledById: me.id, reason: `Admin: ${reason ?? ""}`, penaltyRate: 0, penaltyAmount: 0 } })]),
  ])
  await logAdmin(me.id, "deal.cancel", "deal", id, reason)
  return NextResponse.json({ ok: true })
}

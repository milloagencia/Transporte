import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: dealId } = await params
  const userId = (session.user as { id: string }).id

  const deal = await db.deal.findUnique({ where: { id: dealId }, include: { completion: true } })
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (deal.status !== "paid_escrow") return NextResponse.json({ error: "Deal not in escrow" }, { status: 400 })
  const isDriver = deal.driverId === userId
  const isRequester = deal.requesterId === userId
  if (!isDriver && !isRequester) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const updateData = isDriver ? { confirmedByDriverAt: new Date() } : { confirmedByRequesterAt: new Date() }
  const updated = await db.completionConfirmation.update({ where: { dealId }, data: updateData })
  const bothConfirmed = !!(updated.confirmedByDriverAt && updated.confirmedByRequesterAt)

  if (bothConfirmed) {
    await db.$transaction([
      db.deal.update({ where: { id: dealId }, data: { status: "completed" } }),
      db.payment.update({ where: { dealId }, data: { status: "simulated_released" } }),
    ])
  }
  return NextResponse.json({ ok: true, bothConfirmed })
}

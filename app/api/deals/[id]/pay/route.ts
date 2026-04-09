import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: dealId } = await params
  const userId = (session.user as { id: string }).id

  const deal = await db.deal.findUnique({ where: { id: dealId } })
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (deal.requesterId !== userId) return NextResponse.json({ error: "Only requester can pay" }, { status: 403 })
  if (deal.status !== "accepted_pending_payment") return NextResponse.json({ error: "Not ready for payment" }, { status: 400 })
  if (!deal.finalPrice) return NextResponse.json({ error: "No final price set" }, { status: 400 })

  const platformFee = deal.finalPrice * deal.platformFeeRate

  await db.$transaction([
    db.payment.create({ data: { dealId, amount: deal.finalPrice, platformFee, status: "simulated_escrow" } }),
    db.deal.update({ where: { id: dealId }, data: { status: "paid_escrow" } }),
    db.completionConfirmation.create({
      data: { dealId, autoReleaseAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    }),
  ])
  return NextResponse.json({ ok: true })
}

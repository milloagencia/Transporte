import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string; proposalId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: dealId, proposalId } = await params
  const userId = (session.user as { id: string }).id

  const deal = await db.deal.findUnique({ where: { id: dealId } })
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (deal.driverId !== userId && deal.requesterId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const proposal = await db.proposal.findUnique({ where: { id: proposalId } })
  if (!proposal || proposal.dealId !== dealId) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (proposal.proposedById === userId) {
    return NextResponse.json({ error: "Cannot accept your own proposal" }, { status: 400 })
  }

  await db.$transaction([
    db.proposal.update({ where: { id: proposalId }, data: { status: "accepted" } }),
    db.deal.update({ where: { id: dealId }, data: { status: "accepted_pending_payment", finalPrice: proposal.price } }),
  ])
  return NextResponse.json({ ok: true })
}

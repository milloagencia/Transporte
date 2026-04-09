import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: dealId } = await params
  const userId = (session.user as { id: string }).id
  const body = await req.json()

  const deal = await db.deal.findUnique({ where: { id: dealId } })
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (deal.driverId !== userId && deal.requesterId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (deal.status !== "negotiating") {
    return NextResponse.json({ error: "Deal not in negotiating state" }, { status: 400 })
  }

  // Mark previous pending proposals as countered
  await db.proposal.updateMany({ where: { dealId, status: "pending" }, data: { status: "countered" } })

  const proposal = await db.proposal.create({
    data: { dealId, proposedById: userId, price: body.price, message: body.message },
  })
  return NextResponse.json(proposal, { status: 201 })
}

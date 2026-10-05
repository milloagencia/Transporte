import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { accountBlock } from "@/lib/guards"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: dealId } = await params
  const userId = (session.user as { id: string }).id
  const blocked = accountBlock({ status: (session.user as { status?: string }).status ?? "active" }, "create")
  if (blocked) return blocked
  const body = await req.json()

  const deal = await db.deal.findUnique({ where: { id: dealId } })
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (deal.driverId !== userId && deal.requesterId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  if (deal.status !== "negotiating") {
    return NextResponse.json({ error: "Deal not in negotiating state" }, { status: 400 })
  }

  const price = Number(body.price)
  if (!Number.isFinite(price) || price < 1 || price > 100_000) {
    return NextResponse.json({ error: "rate_invalid" }, { status: 400 })
  }

  // Mark previous pending proposals as countered
  await db.proposal.updateMany({ where: { dealId, status: "pending" }, data: { status: "countered" } })

  const proposal = await db.proposal.create({
    data: { dealId, proposedById: userId, price: Math.round(price * 100) / 100, message: typeof body.message === "string" ? body.message.slice(0, 500) : null },
  })
  return NextResponse.json(proposal, { status: 201 })
}

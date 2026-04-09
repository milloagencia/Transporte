import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id: dealId } = await params
  const userId = (session.user as { id: string }).id
  const body = await req.json()

  const deal = await db.deal.findUnique({
    where: { id: dealId },
    include: { tripOffer: true, tripRequest: true },
  })
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const isDriver = deal.driverId === userId
  const isRequester = deal.requesterId === userId
  if (!isDriver && !isRequester) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (!["negotiating", "accepted_pending_payment"].includes(deal.status)) {
    return NextResponse.json({ error: "Cannot cancel in current state" }, { status: 400 })
  }

  const startTime = deal.tripOffer?.startWindowFrom ?? deal.tripRequest?.windowFrom
  const hoursUntilStart = startTime ? (startTime.getTime() - Date.now()) / (1000 * 60 * 60) : Infinity
  const price = deal.finalPrice ?? 0
  let penaltyRate = 0
  let creditIssued = 0

  if (isRequester) {
    if (hoursUntilStart > 24) penaltyRate = 0.05
    else if (hoursUntilStart >= 6) penaltyRate = 0.25
    else penaltyRate = 0.75
  } else {
    if (hoursUntilStart > 24) { penaltyRate = 0.25; creditIssued = 10 }
    else if (hoursUntilStart >= 6) { penaltyRate = 0.50; creditIssued = 25 }
    else { penaltyRate = 1.0; creditIssued = 50 }
  }

  const penaltyAmount = price * penaltyRate
  const baseOps = [
    db.deal.update({ where: { id: dealId }, data: { status: "cancelled" } }),
    db.cancellation.create({
      data: { dealId, cancelledById: userId, reason: body.reason, penaltyRate, penaltyAmount, creditIssued },
    }),
  ] as const

  if (creditIssued > 0) {
    await db.$transaction([
      ...baseOps,
      db.walletCredit.create({
        data: { userId: deal.requesterId, amount: creditIssued, reason: `Driver cancelled deal ${dealId}` },
      }),
    ])
  } else {
    await db.$transaction([...baseOps])
  }
  return NextResponse.json({ ok: true, penaltyAmount, creditIssued })
}

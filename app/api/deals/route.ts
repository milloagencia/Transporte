import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const deals = await db.deal.findMany({
    where: { OR: [{ driverId: userId }, { requesterId: userId }] },
    include: {
      driver: { select: { name: true, email: true } },
      requester: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(deals)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const body = await req.json()
  let driverId: string
  let requesterId: string

  if (body.tripOfferId) {
    const offer = await db.tripOffer.findUnique({ where: { id: body.tripOfferId } })
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    driverId = offer.driverId
    requesterId = userId
  } else if (body.tripRequestId) {
    const tripReq = await db.tripRequest.findUnique({ where: { id: body.tripRequestId } })
    if (!tripReq) return NextResponse.json({ error: "Request not found" }, { status: 404 })
    requesterId = tripReq.requesterId
    driverId = userId
  } else {
    return NextResponse.json({ error: "Must provide tripOfferId or tripRequestId" }, { status: 400 })
  }

  const deal = await db.deal.create({
    data: { driverId, requesterId, tripOfferId: body.tripOfferId, tripRequestId: body.tripRequestId },
  })
  return NextResponse.json(deal, { status: 201 })
}

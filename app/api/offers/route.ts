import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const offers = await db.tripOffer.findMany({
    where: { status: "active" },
    include: { driver: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(offers)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const body = await req.json()
  const offer = await db.tripOffer.create({
    data: {
      driverId: userId,
      originCity: body.originCity,
      originState: body.originState ?? "NE",
      originZip: body.originZip,
      destCity: body.destCity,
      destState: body.destState ?? "NE",
      destZip: body.destZip,
      startWindowFrom: new Date(body.startWindowFrom),
      startWindowTo: new Date(body.startWindowTo),
      serviceType: body.serviceType,
      exclusivity: body.exclusivity ?? "either",
      seats: body.seats,
      cargoWeightLbs: body.cargoWeightLbs,
      coldChain: body.coldChain ?? "none",
      proposedRate: body.proposedRate,
      maxDetourMiles: body.maxDetourMiles ?? 20,
      pickupRadiusMiles: body.pickupRadiusMiles ?? 10,
    },
  })
  return NextResponse.json(offer, { status: 201 })
}

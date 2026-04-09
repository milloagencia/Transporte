import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const requests = await db.tripRequest.findMany({
    where: { status: "open" },
    include: { requester: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(requests)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const body = await req.json()
  const request = await db.tripRequest.create({
    data: {
      requesterId: userId,
      originCity: body.originCity,
      originState: body.originState ?? "NE",
      originZip: body.originZip,
      destCity: body.destCity,
      destState: body.destState ?? "NE",
      destZip: body.destZip,
      windowFrom: new Date(body.windowFrom),
      windowTo: new Date(body.windowTo),
      serviceType: body.serviceType,
      passengerCount: body.passengerCount,
      cargoWeightLbs: body.cargoWeightLbs,
      cargoDesc: body.cargoDesc,
      coldChainRequired: body.coldChainRequired ?? "none",
      budgetProposed: body.budgetProposed,
      exclusivity: body.exclusivity ?? "either",
    },
  })
  return NextResponse.json(request, { status: 201 })
}

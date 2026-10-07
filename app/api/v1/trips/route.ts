import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getRequestUser, unauthorized } from "@/lib/mobile-auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const me = await getRequestUser(request)
  if (!me) return unauthorized()
  const trips = await db.deal.findMany({
    where: {
      status: "paid_escrow",
      operationalStatus: { in: ["accepted", "on_the_way", "arrived", "in_trip"] },
      OR: [{ driverId: me.id }, { requesterId: me.id }],
    },
    select: {
      id: true,
      operationalStatus: true,
      driverId: true,
      requesterId: true,
      driver: { select: { id: true, name: true } },
      requester: { select: { id: true, name: true } },
      driverLocations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { latitude: true, longitude: true, accuracyM: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  })
  return NextResponse.json(trips, { headers: { "Cache-Control": "no-store" } })
}

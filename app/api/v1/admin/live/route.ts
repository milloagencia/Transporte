import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getRequestUser, unauthorized } from "@/lib/mobile-auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const me = await getRequestUser(request)
  if (!me) return unauthorized()
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const trips = await db.deal.findMany({
    where: {
      status: "paid_escrow",
      operationalStatus: { in: ["on_the_way", "arrived", "in_trip"] },
    },
    select: {
      id: true,
      operationalStatus: true,
      driver: { select: { id: true, name: true } },
      requester: { select: { id: true, name: true } },
      driverLocations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { latitude: true, longitude: true, accuracyM: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
  return NextResponse.json(trips, { headers: { "Cache-Control": "no-store" } })
}

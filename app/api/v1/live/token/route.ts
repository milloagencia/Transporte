import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getRequestUser, unauthorized } from "@/lib/mobile-auth"
import { createRealtimeToken, realtimeConfigured } from "@/lib/live-updates"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const me = await getRequestUser(request)
  if (!me) return unauthorized()
  if (!realtimeConfigured()) {
    return NextResponse.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } })
  }

  const capability: Record<string, string[]> = {}
  if (me.role === "admin") {
    capability["admin:live"] = ["subscribe"]
  } else {
    const deals = await db.deal.findMany({
      where: {
        status: "paid_escrow",
        operationalStatus: { in: ["on_the_way", "arrived", "in_trip"] },
        OR: [{ driverId: me.id }, { requesterId: me.id }],
      },
      select: { id: true },
    })
    for (const deal of deals) capability[`tracking:${deal.id}`] = ["subscribe"]
  }
  const tokenRequest = await createRealtimeToken(me.id, capability)
  if (!tokenRequest) return NextResponse.json({ enabled: false }, { headers: { "Cache-Control": "no-store" } })
  return NextResponse.json({ enabled: true, tokenRequest }, { headers: { "Cache-Control": "no-store" } })
}

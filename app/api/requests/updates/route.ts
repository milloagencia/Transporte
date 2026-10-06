import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ACTIVE_OWNER, getSessionUser } from "@/lib/guards"
import { ratingsFor } from "@/lib/ratings"
import { toRequestRow } from "@/lib/board-rows"

/** New open requests posted after `since` (used by the board's "N new requests" banner). */
export async function GET(req: Request) {
  const me = await getSessionUser()
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const since = new Date(new URL(req.url).searchParams.get("since") ?? "")
  if (isNaN(since.getTime())) return NextResponse.json({ error: "invalid_option" }, { status: 400 })
  const requests = await db.tripRequest.findMany({
    where: { createdAt: { gt: since }, status: "open", windowTo: { gte: new Date() }, requester: ACTIVE_OWNER },
    include: { requester: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  })
  const ratings = await ratingsFor(requests.map((r) => r.requesterId))
  return NextResponse.json({ now: new Date().toISOString(), rows: requests.map((r) => toRequestRow(r, me.id, ratings)) })
}

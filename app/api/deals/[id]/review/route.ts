import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/guards"
import { reviewWindowOpen } from "@/lib/ratings"

/** Leave a rating (1–5) and optional comment for the other person in a completed deal. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me, error } = await requireUser("basic")
  if (error) return error
  const { id: dealId } = await params
  const deal = await db.deal.findUnique({ where: { id: dealId } })
  if (!deal || (deal.driverId !== me.id && deal.requesterId !== me.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (deal.status !== "completed") return NextResponse.json({ error: "review_not_completed" }, { status: 400 })
  if (!reviewWindowOpen(deal.updatedAt)) return NextResponse.json({ error: "review_window_closed" }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const stars = Number(body.stars)
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) return NextResponse.json({ error: "review_stars" }, { status: 400 })
  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) : ""

  const isDriver = deal.driverId === me.id
  try {
    const review = await db.review.create({
      data: {
        dealId,
        authorId: me.id,
        subjectId: isDriver ? deal.requesterId : deal.driverId,
        authorRole: isDriver ? "driver" : "requester",
        stars,
        comment: comment || null,
        commentStatus: comment ? "pending" : "approved",
      },
    })
    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: "review_exists" }, { status: 400 })
  }
}

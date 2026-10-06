import { db } from "@/lib/db"

// How reviews work (similar to Airbnb / Uber):
// - Only the two people in a COMPLETED deal can review each other, once, within REVIEW_WINDOW_DAYS.
// - Reviews are "blind": nobody sees the other's review until both have reviewed or REVEAL_DAYS pass,
//   so nobody changes their review in retaliation.
// - Stars count in the average once revealed (unless an admin hides the review).
// - Written comments are only public after an admin approves them.
export const REVIEW_WINDOW_DAYS = 30
export const REVEAL_DAYS = 14
const DAY = 24 * 3600 * 1000

type R = { dealId: string; createdAt: Date }

/** Ids of deals where both people have already reviewed. */
async function dealsWithBothReviews(dealIds: string[]) {
  if (dealIds.length === 0) return new Set<string>()
  const groups = await db.review.groupBy({ by: ["dealId"], where: { dealId: { in: dealIds } }, _count: { _all: true } })
  return new Set(groups.filter((g) => g._count._all >= 2).map((g) => g.dealId))
}

const revealed = (r: R, both: Set<string>) => both.has(r.dealId) || r.createdAt.getTime() < Date.now() - REVEAL_DAYS * DAY

export type RatingSummary = { avg: number; count: number }

/** Average stars per user (revealed and not hidden reviews only). */
export async function ratingsFor(userIds: string[]): Promise<Map<string, RatingSummary>> {
  const out = new Map<string, RatingSummary>()
  if (userIds.length === 0) return out
  const reviews = await db.review.findMany({
    where: { subjectId: { in: [...new Set(userIds)] }, hidden: false },
    select: { subjectId: true, stars: true, dealId: true, createdAt: true },
  })
  const both = await dealsWithBothReviews([...new Set(reviews.map((r) => r.dealId))])
  const acc = new Map<string, { sum: number; n: number }>()
  for (const r of reviews) {
    if (!revealed(r, both)) continue
    const a = acc.get(r.subjectId) ?? { sum: 0, n: 0 }
    a.sum += r.stars
    a.n += 1
    acc.set(r.subjectId, a)
  }
  for (const [id, a] of acc) out.set(id, { avg: Math.round((a.sum / a.n) * 10) / 10, count: a.n })
  return out
}

/** Public comments about a user: revealed, not hidden, comment approved by an admin. */
export async function publicReviewsFor(userId: string, take = 20) {
  const reviews = await db.review.findMany({
    where: { subjectId: userId, hidden: false, commentStatus: "approved", comment: { not: null } },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: take * 2,
  })
  const both = await dealsWithBothReviews(reviews.map((r) => r.dealId))
  return reviews.filter((r) => revealed(r, both)).slice(0, take)
}

/** Can this user still review this deal? */
export function reviewWindowOpen(dealUpdatedAt: Date) {
  return dealUpdatedAt.getTime() > Date.now() - REVIEW_WINDOW_DAYS * DAY
}

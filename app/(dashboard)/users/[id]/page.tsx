import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/format"
import { publicReviewsFor, ratingsFor } from "@/lib/ratings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RatingBadge, Stars } from "@/components/stars"

/** Public profile (for signed-in users): name, rating and approved comments. Never shows email. */
export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const t = await getTranslations("reviews")
  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, createdAt: true, status: true, accountType: true, wantsToDrive: true, wantsToShip: true, driverProfile: { select: { verificationStatus: true } } },
  })
  if (!user || user.status === "deleted") notFound()
  const [ratings, reviews, completed] = await Promise.all([
    ratingsFor([id]),
    publicReviewsFor(id),
    db.deal.count({ where: { status: "completed", OR: [{ driverId: id }, { requesterId: id }] } }),
  ])
  const r = ratings.get(id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader><CardTitle>{user.name ?? "Usuario"}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-lg"><RatingBadge avg={r?.avg} count={r?.count} empty="Sin calificaciones" /></p>
          <div className="flex flex-wrap gap-2">
            {user.accountType === "company" && <Badge>🏢 {t("company")}</Badge>}
            {user.wantsToDrive && <Badge variant="secondary">🚚 {t("offersTransport")}</Badge>}
            {user.wantsToShip && <Badge variant="secondary">📦 {t("needsTransport")}</Badge>}
            {user.driverProfile?.verificationStatus === "approved" && <Badge variant="success">{t("verifiedDriver")}</Badge>}
          </div>
          <p>{t("trips")}: {completed}</p>
          <p className="text-gray-500">{t("memberSince")} {formatDate(user.createdAt)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">{t("profileTitle")}</CardTitle></CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">{t("noReviews")}</p>
          ) : (
            <ul className="divide-y">
              {reviews.map((rv) => (
                <li key={rv.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <Stars value={rv.stars} />
                    <span className="text-xs text-gray-500">{rv.author.name ?? "Usuario"} · {formatDate(rv.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-gray-700">“{rv.comment}”</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

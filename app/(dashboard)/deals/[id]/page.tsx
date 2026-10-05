import { db } from "@/lib/db"
import { formatDateTime } from "@/lib/format"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DealActions from "./DealActions"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import ReviewForm from "@/components/review-form"
import { Stars } from "@/components/stars"
import { reviewWindowOpen } from "@/lib/ratings"

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      driver: { select: { id: true, name: true, email: true, phone: true } },
      requester: { select: { id: true, name: true, email: true, phone: true } },
      proposals: {
        include: { proposedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      payment: true,
      completion: true,
      reviews: true,
    },
  })
  if (!deal) notFound()

  const currentUserId = (session?.user as { id?: string } | undefined)?.id
  const isDriver = currentUserId === deal.driver.id
  const isRequester = currentUserId === deal.requesterId
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin"
  if (!isDriver && !isRequester && !isAdmin) notFound()
  const t = await getTranslations("reviews")

  // Privacy: emails are only shared once the trip is paid (PRD §5)
  const contactShared = ["paid_escrow", "completed"].includes(deal.status) || isAdmin
  const show = (u: { name: string | null; email: string; phone: string | null }) =>
    contactShared ? [u.name ?? "Usuario", u.email, u.phone].filter(Boolean).join(" · ") : (u.name ?? "Usuario")

  const myReview = deal.reviews.find((r) => r.authorId === currentUserId)
  const otherReview = deal.reviews.find((r) => r.authorId !== currentUserId)
  const canReview = (isDriver || isRequester) && deal.status === "completed" && !myReview && reviewWindowOpen(deal.updatedAt)
  const other = isDriver ? deal.requester : deal.driver

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader><CardTitle>Deal #{deal.id.slice(-8)}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Badge variant={deal.status === "completed" ? "success" : deal.status === "cancelled" ? "destructive" : "default"}>
            {deal.status}
          </Badge>
          <p className="text-sm"><strong>Driver:</strong> <Link href={`/users/${deal.driver.id}`} className="text-blue-700 hover:underline">{show(deal.driver)}</Link></p>
          <p className="text-sm"><strong>Requester:</strong> <Link href={`/users/${deal.requester.id}`} className="text-blue-700 hover:underline">{show(deal.requester)}</Link></p>
          {deal.finalPrice && <p className="text-sm"><strong>Final Price:</strong> ${deal.finalPrice}</p>}
          {(isDriver || isRequester) && currentUserId && (
            <DealActions
              dealId={deal.id}
              status={deal.status}
              proposals={deal.proposals.map((p) => ({
                id: p.id,
                status: p.status,
                price: p.price,
                proposedById: p.proposedById,
              }))}
              currentUserId={currentUserId}
            />
          )}
        </CardContent>
      </Card>

      {deal.status === "completed" && (isDriver || isRequester || isAdmin) && (
        <Card>
          <CardHeader><CardTitle>{t("title")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {canReview && <ReviewForm dealId={deal.id} otherName={other.name ?? "Usuario"} />}
            {myReview && (
              <div className="text-sm">
                <p className="font-medium">{t("yours")}: <Stars value={myReview.stars} /></p>
                {myReview.comment && <p className="mt-1 text-gray-700">“{myReview.comment}”</p>}
                <p className="mt-1 text-xs text-gray-500">
                  {myReview.comment ? t(`status_${myReview.commentStatus}`) : t("noComment")}
                </p>
              </div>
            )}
            {myReview && otherReview && (
              <div className="text-sm">
                <p className="font-medium">{t("theirs")}: <Stars value={otherReview.stars} /></p>
                {otherReview.comment && otherReview.commentStatus === "approved" && <p className="mt-1 text-gray-700">“{otherReview.comment}”</p>}
              </div>
            )}
            {myReview && !otherReview && <p className="text-xs text-gray-500">{t("blind")}</p>}
            {!canReview && !myReview && !isAdmin && <p className="text-sm text-gray-500">{t("closed")}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Proposal History</CardTitle></CardHeader>
        <CardContent>
          {deal.proposals.length === 0 ? (
            <p className="text-sm text-gray-500">No proposals yet.</p>
          ) : (
            <ul className="space-y-3">
              {deal.proposals.map((p) => (
                <li key={p.id} className="border-b pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">${p.price}</span>
                    <Badge variant={p.status === "accepted" ? "success" : p.status === "rejected" ? "destructive" : "secondary"}>
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    By {p.proposedBy.name ?? "Usuario"} · {formatDateTime(p.createdAt)}
                  </p>
                  {p.message && <p className="text-sm text-gray-700 mt-1">{p.message}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { destLabel, rateLabel } from "@/lib/trip-labels"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import NextSteps from "@/components/next-steps"
import { getSessionUser } from "@/lib/guards"
import { getTranslations } from "next-intl/server"

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const me = await getSessionUser()
  const { welcome } = await searchParams
  const session = await auth()
  if (!session?.user) return null
  const userId = (session.user as { id: string }).id
  const t = await getTranslations("dash")
  const td = await getTranslations("deals")
  const ts = await getTranslations("status")
  const [offers, requests, deals] = await Promise.all([
    db.tripOffer.findMany({ where: { driverId: userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.tripRequest.findMany({ where: { requesterId: userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.deal.findMany({ where: { OR: [{ driverId: userId }, { requesterId: userId }] }, orderBy: { createdAt: "desc" }, take: 5 }),
  ])
  const showOffers = offers.length > 0 || me?.wantsToDrive || (session.user as { role?: string }).role !== "user"
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {me && <NextSteps me={me} welcome={welcome === "1"} />}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Customers who only ship/travel don't publish offers; keep the card for drivers (or anyone who has offers) */}
        {showOffers && <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("myOffers")}</CardTitle>
            <Link href="/offers/new"><Button size="sm">{t("new")}</Button></Link>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? <p className="text-sm text-gray-500">{t("noOffers")}</p> : (
              <ul className="space-y-2">{offers.map((o) => <li key={o.id}><Link href={`/offers/${o.id}`} className="text-sm text-blue-600 hover:underline">{o.originCity} → {destLabel(o)} ({rateLabel(o.proposedRate, o.rateUnit)})</Link></li>)}</ul>
            )}
          </CardContent>
        </Card>}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("myRequests")}</CardTitle>
            <Link href="/requests/new"><Button size="sm">{t("new")}</Button></Link>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? <p className="text-sm text-gray-500">{t("noRequests")}</p> : (
              <ul className="space-y-2">{requests.map((r) => <li key={r.id}><Link href={`/requests/${r.id}`} className="text-sm text-blue-600 hover:underline">{r.originCity} → {r.destCity}</Link></li>)}</ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("myDeals")}</CardTitle></CardHeader>
          <CardContent>
            {deals.length === 0 ? <p className="text-sm text-gray-500">{t("noDeals")}</p> : (
              <ul className="space-y-2">{deals.map((d) => <li key={d.id}><Link href={`/deals/${d.id}`} className="text-sm text-blue-600 hover:underline">{td("dealNo", { id: d.id.slice(-6) })} — {ts(d.status)}</Link></li>)}</ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

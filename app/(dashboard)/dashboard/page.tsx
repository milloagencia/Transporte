import { auth } from "@/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = (session.user as { id: string }).id
  const [offers, requests, deals] = await Promise.all([
    db.tripOffer.findMany({ where: { driverId: userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.tripRequest.findMany({ where: { requesterId: userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    db.deal.findMany({ where: { OR: [{ driverId: userId }, { requesterId: userId }] }, orderBy: { createdAt: "desc" }, take: 5 }),
  ])
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Offers</CardTitle>
            <Link href="/offers/new"><Button size="sm">New</Button></Link>
          </CardHeader>
          <CardContent>
            {offers.length === 0 ? <p className="text-sm text-gray-500">No offers yet.</p> : (
              <ul className="space-y-2">{offers.map((o) => <li key={o.id}><Link href={`/offers/${o.id}`} className="text-sm text-blue-600 hover:underline">{o.originCity} → {o.destCity} (${o.proposedRate})</Link></li>)}</ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Requests</CardTitle>
            <Link href="/requests/new"><Button size="sm">New</Button></Link>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? <p className="text-sm text-gray-500">No requests yet.</p> : (
              <ul className="space-y-2">{requests.map((r) => <li key={r.id}><Link href={`/requests/${r.id}`} className="text-sm text-blue-600 hover:underline">{r.originCity} → {r.destCity}</Link></li>)}</ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Active Deals</CardTitle></CardHeader>
          <CardContent>
            {deals.length === 0 ? <p className="text-sm text-gray-500">No deals yet.</p> : (
              <ul className="space-y-2">{deals.map((d) => <li key={d.id}><Link href={`/deals/${d.id}`} className="text-sm text-blue-600 hover:underline">Deal #{d.id.slice(-6)} — {d.status}</Link></li>)}</ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function OffersPage() {
  const offers = await db.tripOffer.findMany({
    where: { status: "active" },
    include: { driver: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trip Offers</h1>
        <Link href="/offers/new"><Button>Post New Offer</Button></Link>
      </div>
      {offers.length === 0 ? (
        <p className="text-gray-500">No offers yet. Be the first to post one!</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <Card key={o.id}>
              <CardHeader>
                <CardTitle className="text-base">{o.originCity}, {o.originState} → {o.destCity}, {o.destState}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Badge>{o.serviceType}</Badge>
                  <Badge variant="secondary">{o.exclusivity}</Badge>
                </div>
                <p className="text-sm">Rate: <strong>${o.proposedRate}</strong></p>
                <p className="text-sm">Driver: {o.driver.name ?? o.driver.email}</p>
                <Link href={`/offers/${o.id}`}><Button size="sm" className="w-full mt-2">View Details</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

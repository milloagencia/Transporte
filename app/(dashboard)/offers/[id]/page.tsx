import { db } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StartDealButton from "./StartDealButton"

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const offer = await db.tripOffer.findUnique({
    where: { id },
    include: { driver: { select: { id: true, name: true, email: true } } },
  })
  if (!offer) notFound()
  const currentUserId = (session?.user as { id?: string } | undefined)?.id

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{offer.originCity}, {offer.originState} → {offer.destCity}, {offer.destState}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Badge>{offer.serviceType}</Badge>
            <Badge variant="secondary">{offer.exclusivity}</Badge>
            <Badge variant={offer.status === "active" ? "success" : "secondary"}>{offer.status}</Badge>
          </div>
          <p className="text-sm"><strong>Rate:</strong> ${offer.proposedRate}</p>
          <p className="text-sm"><strong>Driver:</strong> {offer.driver.name ?? offer.driver.email}</p>
          <p className="text-sm"><strong>Window:</strong> {new Date(offer.startWindowFrom).toLocaleString()} – {new Date(offer.startWindowTo).toLocaleString()}</p>
          {offer.seats && <p className="text-sm"><strong>Seats:</strong> {offer.seats}</p>}
          <p className="text-sm"><strong>Cold Chain:</strong> {offer.coldChain}</p>
          {currentUserId && currentUserId !== offer.driver.id && (
            <StartDealButton offerId={offer.id} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

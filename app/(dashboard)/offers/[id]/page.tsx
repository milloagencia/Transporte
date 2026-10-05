import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { ACTIVE_OWNER } from "@/lib/guards"
import { auth } from "@/auth"
import { inchesLabel, matchTrip } from "@/lib/matching"
import { formatDateTime, formatDate } from "@/lib/format"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StartDealButton from "./StartDealButton"

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const t = await getTranslations("trip")
  const tv = await getTranslations("vehicles")
  const offer = await db.tripOffer.findUnique({
    where: { id },
    include: { driver: { select: { id: true, name: true } }, vehicle: true },
  })
  if (!offer) notFound()
  const currentUserId = (session?.user as { id?: string } | undefined)?.id
  const isOwner = currentUserId === offer.driver.id

  // Open requests that fit in this trip (shown to the driver)
  const compatible = isOwner
    ? (await db.tripRequest.findMany({ where: { status: "open", requesterId: { not: offer.driverId }, windowTo: { gte: new Date() }, requester: ACTIVE_OWNER }, orderBy: { windowFrom: "asc" }, take: 100 }))
        .filter((r) => matchTrip(offer, r).ok)
    : []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{offer.originCity}, {offer.originState} → {offer.destCity}, {offer.destState}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Badge>{t(offer.serviceType)}</Badge>
            <Badge variant="secondary">{t(offer.exclusivity)}</Badge>
            <Badge variant={offer.status === "active" ? "success" : "secondary"}>{offer.status}</Badge>
          </div>
          <p className="text-sm"><strong>{t("rate")}:</strong> ${offer.proposedRate}</p>
          <p className="text-sm"><strong>Driver:</strong> {offer.driver.name ?? "Usuario"}</p>
          <p className="text-sm"><strong>{t("from")}:</strong> {formatDateTime(offer.startWindowFrom)} – {formatDateTime(offer.startWindowTo)}</p>
          {offer.vehicle && (
            <p className="text-sm"><strong>{t("vehicle")}:</strong> {offer.vehicle.make} {offer.vehicle.model} ({tv(`cat_${offer.vehicle.category}`)})</p>
          )}
          <div className="rounded-md bg-gray-50 p-3 text-sm">
            <p className="font-medium">{t("capacity")}</p>
            {offer.seats != null && <p>{t("seats")}: {offer.seats}</p>}
            {offer.cargoLengthIn != null && (
              <p>{t("space")}: {inchesLabel(offer.cargoLengthIn, offer.cargoWidthIn, offer.cargoHeightIn)}{offer.openTop ? ` (${t("openTop")})` : ""}</p>
            )}
            {offer.cargoWeightLbs != null && <p>{t("maxWeight")}: {Math.round(offer.cargoWeightLbs)} lb</p>}
            <p>{tv("coldChain")}: {tv(`cold_${offer.coldChain}`)}</p>
          </div>
          {currentUserId && !isOwner && <StartDealButton offerId={offer.id} />}
        </CardContent>
      </Card>

      {isOwner && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t("compatibleRequests")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {compatible.length === 0 ? (
              <p className="text-sm text-gray-500">{t("noneCompatible")}</p>
            ) : (
              compatible.map((r) => (
                <Link key={r.id} href={`/requests/${r.id}`} className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-gray-50">
                  <span>
                    {r.originCity} → {r.destCity} · {formatDate(r.windowFrom)} ·{" "}
                    {r.serviceType === "people"
                      ? `${r.passengerCount ?? 1} ${t("people").toLowerCase()}`
                      : `${inchesLabel(r.cargoLengthIn, r.cargoWidthIn, r.cargoHeightIn)}, ${Math.round(r.cargoWeightLbs ?? 0)} lb`}
                  </span>
                  <Badge variant="success">{t("fits")}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

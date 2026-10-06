import { destLabel, rateLabel } from "@/lib/trip-labels"
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
import StartDealFromRequestButton from "./StartDealFromRequestButton"
import RequestAlertButton from "./RequestAlertButton"

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const t = await getTranslations("trip")
  const tv = await getTranslations("vehicles")
  const request = await db.tripRequest.findUnique({
    where: { id },
    include: { requester: { select: { id: true, name: true } } },
  })
  if (!request) notFound()
  const currentUserId = (session?.user as { id?: string } | undefined)?.id
  const isOwner = currentUserId === request.requester.id

  // For the requester: active offers where this request fits
  const offers = isOwner
    ? await db.tripOffer.findMany({
        where: { status: "active", driverId: { not: request.requesterId }, startWindowTo: { gte: new Date() }, driver: ACTIVE_OWNER },
        include: { vehicle: true },
        orderBy: { startWindowFrom: "asc" },
        take: 100,
      })
    : []
  const compatible = offers.filter((o) => matchTrip(o, request).ok)
  const ta = await getTranslations("alerts")
  const alertActive = isOwner ? Boolean(await db.tripAlert.findFirst({ where: { requestId: request.id, active: true } })) : false

  // For a driver looking at the request: does it fit in any of their active offers?
  const myOffers = currentUserId && !isOwner
    ? await db.tripOffer.findMany({ where: { driverId: currentUserId, status: "active", startWindowTo: { gte: new Date() } } })
    : []
  const myChecks = myOffers.map((o) => ({ offer: o, result: matchTrip(o, request) }))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{request.originCity}, {request.originState} → {request.destCity}, {request.destState}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Badge>{t(request.serviceType)}</Badge>
            <Badge variant="secondary">{t(request.exclusivity)}</Badge>
          </div>
          {request.budgetProposed && <p className="text-sm"><strong>{t("budget")}:</strong> ${request.budgetProposed}</p>}
          <p className="text-sm"><strong>Requester:</strong> {request.requester.name ?? "Usuario"}</p>
          <p className="text-sm"><strong>{t("from")}:</strong> {formatDateTime(request.windowFrom)} – {formatDateTime(request.windowTo)}</p>
          <div className="rounded-md bg-gray-50 p-3 text-sm">
            {request.serviceType === "people" ? (
              <p>{t("passengers")}: {request.passengerCount ?? 1}</p>
            ) : (
              <>
                <p>{t("cargoWeight")}: {Math.round(request.cargoWeightLbs ?? 0)} lb · {t("cargoPieces")}: {request.cargoPieces ?? 1}</p>
                <p>{t("cargoDims")}: {inchesLabel(request.cargoLengthIn, request.cargoWidthIn, request.cargoHeightIn)}</p>
                {request.coldChainRequired !== "none" && <p>{t("coldRequired")}: {tv(`cold_${request.coldChainRequired}`)}</p>}
                {request.cargoDesc && <p>{request.cargoDesc}</p>}
              </>
            )}
          </div>
          {myChecks.length > 0 && (
            <div className="space-y-1 text-sm">
              {myChecks.map(({ offer, result }) => (
                <p key={offer.id}>
                  <Badge variant={result.ok ? "success" : "destructive"}>{result.ok ? t("fits") : t("doesNotFit")}</Badge>{" "}
                  {offer.originCity} → {offer.destCity}
                  {!result.ok && ` (${result.reasons.map((r) => t(`r_${r}`)).join(", ")})`}
                </p>
              ))}
            </div>
          )}
          {currentUserId && !isOwner && <StartDealFromRequestButton requestId={request.id} />}
        </CardContent>
      </Card>

      {isOwner && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t("compatibleOffers")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {request.status === "open" && (
              <div className="mb-3">
                {alertActive ? <p className="text-sm text-emerald-700">🔔 {ta("created")}</p> : <RequestAlertButton requestId={request.id} />}
              </div>
            )}
            {compatible.length === 0 ? (
              <p className="text-sm text-gray-500">{t("noneCompatible")}</p>
            ) : (
              compatible.map((o) => (
                <Link key={o.id} href={`/offers/${o.id}`} className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-gray-50">
                  <span>
                    {o.originCity} → {destLabel(o)} · {formatDate(o.startWindowFrom)} · {rateLabel(o.proposedRate, o.rateUnit)}
                    {o.vehicle ? ` · ${o.vehicle.make} ${o.vehicle.model}` : ""}
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

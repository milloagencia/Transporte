import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { getSessionUser, ACTIVE_OWNER } from "@/lib/guards"
import { Button } from "@/components/ui/button"
import { ratingsFor } from "@/lib/ratings"
import OffersBoard, { type OfferRow } from "@/components/board/offers-board"

export default async function OffersPage() {
  const me = await getSessionUser()
  const t = await getTranslations("board")
  const offers = await db.tripOffer.findMany({
    where: { status: "active", startWindowTo: { gte: new Date() }, driver: ACTIVE_OWNER },
    include: { driver: { select: { name: true } }, vehicle: { select: { make: true, model: true, category: true } } },
    orderBy: { startWindowFrom: "asc" },
    take: 1000,
  })
  const ratings = await ratingsFor(offers.map((o) => o.driverId))
  const rows: OfferRow[] = offers.map((o) => ({
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    from: o.startWindowFrom.toISOString(),
    to: o.startWindowTo.toISOString(),
    originCity: o.originCity, originState: o.originState, destCity: o.destCity, destState: o.destState,
    serviceType: o.serviceType, exclusivity: o.exclusivity,
    seats: o.seats, cargoWeightLbs: o.cargoWeightLbs,
    cargoLengthIn: o.cargoLengthIn, cargoWidthIn: o.cargoWidthIn, cargoHeightIn: o.cargoHeightIn, openTop: o.openTop,
    coldChain: o.coldChain, rate: o.proposedRate,
    driverName: o.driver.name ?? "Usuario",
    driverId: o.driverId,
    ratingAvg: ratings.get(o.driverId)?.avg ?? null,
    ratingCount: ratings.get(o.driverId)?.count ?? 0,
    vehicleLabel: o.vehicle ? `${o.vehicle.make} ${o.vehicle.model}` : null,
    vehicleCategory: o.vehicle?.category ?? null,
    mine: o.driverId === me?.id,
  }))
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("offersTitle")}</h1>
          <p className="text-sm text-slate-600">{t("offersSubtitle")}</p>
        </div>
        <Link href="/offers/new"><Button>{t("newOffer")}</Button></Link>
      </div>
      <OffersBoard rows={rows} />
    </div>
  )
}

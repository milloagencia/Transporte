import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { getSessionUser, ACTIVE_OWNER } from "@/lib/guards"
import { Button } from "@/components/ui/button"
import { ratingsFor } from "@/lib/ratings"
import { toRequestRow } from "@/lib/board-rows"
import RequestsBoard, { type MyVehicle, type RequestRow } from "@/components/board/requests-board"

export default async function RequestsPage() {
  const me = await getSessionUser()
  const t = await getTranslations("board")
  const [requests, vehicles] = await Promise.all([
    db.tripRequest.findMany({
      where: { status: "open", windowTo: { gte: new Date() }, requester: ACTIVE_OWNER },
      include: { requester: { select: { name: true } } },
      orderBy: { windowFrom: "asc" },
      take: 1000,
    }),
    me ? db.vehicle.findMany({ where: { ownerId: me.id, active: true } }) : [],
  ])
  const ratings = await ratingsFor(requests.map((r) => r.requesterId))
  const rows: RequestRow[] = requests.map((r) => toRequestRow(r, me?.id, ratings))
  const myVehicles: MyVehicle[] = vehicles.map((v) => ({
    id: v.id, label: `${v.make} ${v.model}`, seats: v.seats, payloadLbs: v.payloadLbs,
    cargoLengthIn: v.cargoLengthIn, cargoWidthIn: v.cargoWidthIn, cargoHeightIn: v.cargoHeightIn,
    openTop: v.openTop, coldChain: v.coldChain,
  }))
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("requestsTitle")}</h1>
          <p className="text-sm text-slate-600">{t("requestsSubtitle")}</p>
        </div>
        <Link href="/requests/new"><Button>{t("newRequest")}</Button></Link>
      </div>
      <RequestsBoard rows={rows} vehicles={myVehicles} loadedAt={new Date().toISOString()} />
    </div>
  )
}

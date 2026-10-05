import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/guards"
import { inchesLabel } from "@/lib/matching"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import VehicleForm from "@/components/vehicle-form"
import RemoveVehicleButton from "@/components/remove-vehicle-button"

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams
  const me = await getSessionUser()
  if (!me) redirect("/auth/signin")
  const t = await getTranslations("vehicles")
  const tt = await getTranslations("trip")
  const vehicles = await db.vehicle.findMany({ where: { ownerId: me.id, active: true }, orderBy: { createdAt: "desc" } })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {welcome === "1" && <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-900">{t("welcomeDriver")}</p>}
      {vehicles.length === 0 ? (
        <p className="text-gray-500">{t("none")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {vehicles.map((v) => (
            <Card key={v.id}>
              <CardHeader>
                <CardTitle className="text-base">{v.make} {v.model}{v.year ? ` · ${v.year}` : ""}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Badge variant="secondary">{t(`cat_${v.category}`)}</Badge>
                <p><strong>{t("plate")}:</strong> {v.plateNumber ? `${v.plateNumber} (${v.plateState ?? "NE"})` : <span className="text-amber-700">{t("plateMissing")}</span>}{v.color ? ` · ${v.color}` : ""}</p>
                <p><strong>{tt("seats")}:</strong> {v.seats}</p>
                <p><strong>{tt("space")}:</strong> {inchesLabel(v.cargoLengthIn, v.cargoWidthIn, v.cargoHeightIn)}{v.openTop ? ` (${tt("openTop")})` : ""}</p>
                <p><strong>{tt("maxWeight")}:</strong> {Math.round(v.payloadLbs)} lb</p>
                <p><strong>{t("coldChain")}:</strong> {t(`cold_${v.coldChain}`)}</p>
                <RemoveVehicleButton id={v.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Card>
        <CardHeader><CardTitle>{t("add")}</CardTitle></CardHeader>
        <CardContent><VehicleForm /></CardContent>
      </Card>
    </div>
  )
}

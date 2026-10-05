import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminActions from "./AdminActions"
import DemoActions from "./DemoActions"
import Link from "next/link"
import { formatDate } from "@/lib/format"

export default async function AdminPage() {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined
  if (user?.role !== "admin") redirect("/dashboard")

  const demoFilter = { email: { endsWith: "@demo.collagetaxi.com" } }
  const [users, demoUsers, activeOffers, openRequests, dealsByStatus, recentDeals] = await Promise.all([
    db.user.count(),
    db.user.count({ where: demoFilter }),
    db.tripOffer.count({ where: { status: "active", startWindowTo: { gte: new Date() } } }),
    db.tripRequest.count({ where: { status: "open", windowTo: { gte: new Date() } } }),
    db.deal.groupBy({ by: ["status"], _count: { _all: true } }),
    db.deal.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { tripOffer: true, driver: { select: { name: true, email: true } }, requester: { select: { name: true, email: true } } },
    }),
  ])
  const [pendingDrivers, config] = await Promise.all([
    db.driverProfile.findMany({
      where: { verificationStatus: "pending" },
      include: { user: { select: { id: true, email: true, name: true } } },
    }),
    db.platformConfig.findMany(),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Usuarios", users],
          ["Ofertas activas", activeOffers],
          ["Solicitudes abiertas", openRequests],
          ["Acuerdos", dealsByStatus.reduce((n, d) => n + d._count._all, 0)],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Acuerdos recientes (todos)</CardTitle></CardHeader>
        <CardContent>
          <div className="mb-3 flex flex-wrap gap-2">
            {dealsByStatus.map((d) => <Badge key={d.status} variant="secondary">{d.status}: {d._count._all}</Badge>)}
          </div>
          {recentDeals.length === 0 ? (
            <p className="text-sm text-gray-500">Todavía no hay acuerdos.</p>
          ) : (
            <ul className="divide-y text-sm">
              {recentDeals.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2">
                  <Link href={`/deals/${d.id}`} className="text-blue-600 hover:underline">
                    {d.tripOffer ? `${d.tripOffer.originCity} → ${d.tripOffer.destCity} · ${formatDate(d.tripOffer.startWindowFrom)}` : d.id}
                  </Link>
                  <span className="text-gray-600">
                    {d.driver.name ?? d.driver.email} / {d.requester.name ?? d.requester.email} · {d.finalPrice ? `$${d.finalPrice}` : "—"}{" "}
                    <Badge>{d.status}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Datos de demostración ({demoUsers} usuarios demo)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Usuarios, vehículos, viajes y acuerdos ficticios (nombres terminados en “· Demo”) para ver la plataforma funcionando.
            Bórralos antes de abrir la app al público.
          </p>
          <DemoActions />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Driver Verification Queue ({pendingDrivers.length})</CardTitle></CardHeader>
        <CardContent>
          {pendingDrivers.length === 0 ? (
            <p className="text-sm text-gray-500">No pending verifications.</p>
          ) : (
            <ul className="space-y-3">
              {pendingDrivers.map((dp) => (
                <li key={dp.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{dp.user.name ?? dp.user.email}</p>
                    <Badge variant="warning">{dp.verificationStatus}</Badge>
                  </div>
                  <AdminActions userId={dp.user.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Platform Config</CardTitle></CardHeader>
        <CardContent>
          {config.length === 0 ? (
            <p className="text-sm text-gray-500">No config entries yet.</p>
          ) : (
            <ul className="space-y-1">
              {config.map((c) => (
                <li key={c.key} className="text-sm"><strong>{c.key}:</strong> {c.value}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

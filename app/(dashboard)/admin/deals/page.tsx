import Link from "next/link"
import { db } from "@/lib/db"
import { formatDateTime } from "@/lib/format"
import AdminAction from "../AdminAction"

const STATUSES = ["negotiating", "accepted_pending_payment", "paid_escrow", "completed", "cancelled", "disputed"]

export default async function AdminDealsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams
  const deals = await db.deal.findMany({
    where: sp.status ? { status: sp.status as "negotiating" } : {},
    include: {
      tripOffer: true, tripRequest: true, payment: true,
      driver: { select: { id: true, name: true } }, requester: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 300,
  })
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Acuerdos</h1>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/deals" className="text-slate-600 hover:underline">Todos</Link>
        {STATUSES.map((s) => <Link key={s} href={`/admin/deals?status=${s}`} className={`hover:underline ${sp.status === s ? "font-semibold" : "text-slate-600"}`}>{s}</Link>)}
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase text-slate-100">
            <tr><th className="px-2 py-2">Acuerdo</th><th className="px-2 py-2">Ruta</th><th className="px-2 py-2">Conductor</th><th className="px-2 py-2">Cliente</th><th className="px-2 py-2">Precio</th><th className="px-2 py-2">Pago</th><th className="px-2 py-2">Estado</th><th className="px-2 py-2">Actualizado</th><th className="px-2 py-2" /></tr>
          </thead>
          <tbody>
            {deals.map((d) => {
              const trip = d.tripOffer ?? d.tripRequest
              return (
                <tr key={d.id} className="border-t">
                  <td className="px-2 py-1.5"><Link href={`/deals/${d.id}`} className="text-blue-700 hover:underline">#{d.id.slice(-8)}</Link></td>
                  <td className="whitespace-nowrap px-2 py-1.5">{trip ? `${trip.originCity} → ${trip.destCity || "*"}` : "—"}</td>
                  <td className="px-2 py-1.5"><Link href={`/users/${d.driver.id}`} className="hover:underline">{d.driver.name ?? "—"}</Link></td>
                  <td className="px-2 py-1.5"><Link href={`/users/${d.requester.id}`} className="hover:underline">{d.requester.name ?? "—"}</Link></td>
                  <td className="px-2 py-1.5">{d.finalPrice ? `$${d.finalPrice}` : "—"}</td>
                  <td className="px-2 py-1.5 text-xs">{d.payment ? `${d.payment.status} · comisión $${d.payment.platformFee}` : "—"}</td>
                  <td className="px-2 py-1.5">{d.status}</td>
                  <td className="whitespace-nowrap px-2 py-1.5 text-xs">{formatDateTime(d.updatedAt)}</td>
                  <td className="px-2 py-1.5">
                    {!["completed", "cancelled"].includes(d.status) && <AdminAction url={`/api/admin/deals/${d.id}`} body={{ action: "cancel" }} label="Cancelar" tone="danger" reason />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import Link from "next/link"
import { db } from "@/lib/db"
import { formatDateTime } from "@/lib/format"
import AdminAction from "../AdminAction"

export default async function AdminTripsPage({ searchParams }: { searchParams: Promise<{ tab?: string; status?: string }> }) {
  const sp = await searchParams
  const tab = sp.tab === "requests" ? "requests" : "offers"
  const tabCls = (on: boolean) => `rounded-md px-3 py-1.5 text-sm ${on ? "bg-slate-800 text-white" : "border bg-white"}`

  const rows =
    tab === "offers"
      ? (await db.tripOffer.findMany({
          where: sp.status ? { status: sp.status as "active" } : {},
          include: { driver: { select: { id: true, name: true, status: true } }, _count: { select: { deals: true } } },
          orderBy: { createdAt: "desc" },
          take: 300,
        })).map((o) => ({
          id: o.id, href: `/offers/${o.id}`, api: `/api/admin/offers/${o.id}`, route: `${o.originCity}, ${o.originState} → ${o.destCity}, ${o.destState}`,
          when: formatDateTime(o.startWindowFrom), who: o.driver, status: o.status, open: o.status === "active", closed: o.status === "cancelled",
          price: `$${o.proposedRate}`, deals: o._count.deals, type: o.serviceType,
        }))
      : (await db.tripRequest.findMany({
          where: sp.status ? { status: sp.status as "open" } : {},
          include: { requester: { select: { id: true, name: true, status: true } }, _count: { select: { deals: true } } },
          orderBy: { createdAt: "desc" },
          take: 300,
        })).map((r) => ({
          id: r.id, href: `/requests/${r.id}`, api: `/api/admin/requests/${r.id}`, route: `${r.originCity}, ${r.originState} → ${r.destCity}, ${r.destState}`,
          when: formatDateTime(r.windowFrom), who: r.requester, status: r.status, open: r.status === "open", closed: r.status === "cancelled",
          price: r.budgetProposed ? `$${r.budgetProposed}` : "—", deals: r._count.deals, type: r.serviceType,
        }))

  const statuses = tab === "offers" ? ["active", "paused", "cancelled", "completed"] : ["open", "in_negotiation", "cancelled", "completed"]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ofertas y solicitudes</h1>
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/trips?tab=offers" className={tabCls(tab === "offers")}>Ofertas</Link>
        <Link href="/admin/trips?tab=requests" className={tabCls(tab === "requests")}>Solicitudes</Link>
        <span className="mx-2 text-slate-300">|</span>
        <Link href={`/admin/trips?tab=${tab}`} className="text-sm text-slate-600 hover:underline">Todas</Link>
        {statuses.map((s) => <Link key={s} href={`/admin/trips?tab=${tab}&status=${s}`} className="text-sm text-slate-600 hover:underline">{s}</Link>)}
        <span className="ml-auto text-sm text-slate-600">{rows.length} resultados</span>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase text-slate-100">
            <tr><th className="px-2 py-2">Ruta</th><th className="px-2 py-2">Fecha</th><th className="px-2 py-2">Tipo</th><th className="px-2 py-2">Usuario</th><th className="px-2 py-2">Precio</th><th className="px-2 py-2">Estado</th><th className="px-2 py-2">Acuerdos</th><th className="px-2 py-2">Acciones</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-2 py-1.5"><Link href={r.href} className="text-blue-700 hover:underline">{r.route}</Link></td>
                <td className="whitespace-nowrap px-2 py-1.5">{r.when}</td>
                <td className="px-2 py-1.5">{r.type}</td>
                <td className="px-2 py-1.5">
                  <Link href={`/users/${r.who.id}`} className="hover:underline">{r.who.name ?? "—"}</Link>
                  {r.who.status !== "active" && <span className="ml-1 text-xs text-amber-700">({r.who.status})</span>}
                </td>
                <td className="px-2 py-1.5">{r.price}</td>
                <td className="px-2 py-1.5">{r.status}</td>
                <td className="px-2 py-1.5 text-center">{r.deals}</td>
                <td className="px-2 py-1.5">
                  <div className="flex gap-1">
                    {!r.closed && <AdminAction url={r.api} body={{ action: "cancel" }} label="Cancelar" tone="warning" reason />}
                    {r.closed && <AdminAction url={r.api} body={{ action: "reactivate" }} label="Reactivar" tone="success" />}
                    {r.deals === 0 && <AdminAction url={r.api} method="DELETE" label="Borrar" tone="danger" confirm />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

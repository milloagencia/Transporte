import Link from "next/link"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/format"
import { ratingsFor } from "@/lib/ratings"
import { RatingBadge } from "@/components/stars"
import AdminAction from "../AdminAction"
import type { Prisma } from "@prisma/client"

const STATUS_LABEL: Record<string, [string, string]> = {
  active: ["Activo", "bg-emerald-100 text-emerald-800"],
  payment_hold: ["En espera (pago)", "bg-amber-100 text-amber-800"],
  suspended: ["Suspendido", "bg-red-100 text-red-800"],
  deleted: ["Eliminado", "bg-slate-200 text-slate-600"],
}
const VERIF: Record<string, string> = { pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado", expired: "Vencido" }

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; role?: string; driver?: string; type?: string }> }) {
  const sp = await searchParams
  const where: Prisma.UserWhereInput = {}
  if (sp.q) where.OR = [{ name: { contains: sp.q, mode: "insensitive" } }, { email: { contains: sp.q, mode: "insensitive" } }]
  if (sp.status) where.status = sp.status as Prisma.UserWhereInput["status"]
  if (sp.role) where.role = sp.role as Prisma.UserWhereInput["role"]
  if (sp.type === "individual" || sp.type === "company") where.accountType = sp.type
  if (sp.type === "drive") where.wantsToDrive = true
  if (sp.type === "ship") where.wantsToShip = true
  if (sp.driver) where.driverProfile = { verificationStatus: sp.driver as "pending" }

  const users = await db.user.findMany({
    where,
    include: {
      driverProfile: true,
      _count: { select: { tripOffers: true, tripRequests: true, dealsAsDriver: true, dealsAsRequester: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  })
  const ratings = await ratingsFor(users.map((u) => u.id))
  const sel = "h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <form className="flex flex-wrap items-end gap-2 rounded-lg border bg-white p-3">
        <input name="q" defaultValue={sp.q} placeholder="Nombre o correo" className={sel + " w-56"} />
        <select name="status" defaultValue={sp.status ?? ""} className={sel}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select name="role" defaultValue={sp.role ?? ""} className={sel}>
          <option value="">Todos los roles</option>
          <option value="user">Cliente</option>
          <option value="driver">Conductor</option>
          <option value="admin">Admin</option>
        </select>
        <select name="type" defaultValue={sp.type ?? ""} className={sel}>
          <option value="">Personas y empresas</option>
          <option value="individual">Personas</option>
          <option value="company">Empresas</option>
          <option value="drive">Ofrecen transporte</option>
          <option value="ship">Buscan transporte</option>
        </select>
        <select name="driver" defaultValue={sp.driver ?? ""} className={sel}>
          <option value="">Verificación: todas</option>
          {Object.entries(VERIF).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <button className="h-9 rounded-md bg-blue-600 px-4 text-sm font-medium text-white">Filtrar</button>
        <Link href="/admin/users" className="h-9 px-2 py-2 text-sm text-slate-600 hover:underline">Limpiar</Link>
        <span className="ml-auto text-sm text-slate-600">{users.length} usuarios</span>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase text-slate-100">
            <tr>
              <th className="px-2 py-2">Usuario</th><th className="px-2 py-2">Estado</th><th className="px-2 py-2">Conductor</th>
              <th className="px-2 py-2">Calif.</th><th className="px-2 py-2">Actividad</th><th className="px-2 py-2">Alta</th><th className="px-2 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const r = ratings.get(u.id)
              const [label, cls] = STATUS_LABEL[u.status]
              const dp = u.driverProfile
              const url = `/api/admin/users/${u.id}`
              return (
                <tr key={u.id} className="border-t align-top">
                  <td className="px-2 py-2">
                    <Link href={`/users/${u.id}`} className="font-medium text-blue-700 hover:underline">{u.name ?? "—"}</Link>
                    <div className="text-xs text-slate-500">{u.email}</div>
                    {u.role === "admin" && <span className="text-xs font-semibold text-blue-700">ADMIN</span>}
                    <div className="text-xs text-slate-600">
                      {u.accountType === "company" ? "🏢 Empresa" : "🙋 Persona"}
                      {u.contactName && ` · contacto: ${u.contactName}`}
                      {u.wantsToShip && " · 📦 busca transporte"}{u.wantsToDrive && " · 🚚 ofrece transporte"}
                      {!u.onboardedAt && " · ⚠ sin completar registro"}
                    </div>
                    {u.phone && <div className="text-xs text-slate-500">☎ {u.phone}</div>}
                    {u.usdotNumber && <div className="text-xs text-slate-500">USDOT {u.usdotNumber}</div>}
                  </td>
                  <td className="px-2 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
                    {u.statusReason && <div className="mt-1 max-w-[14rem] text-xs text-slate-500">{u.statusReason}</div>}
                  </td>
                  <td className="px-2 py-2 text-xs">
                    {dp ? (
                      <>
                        <div className="font-medium">{VERIF[dp.verificationStatus]}</div>
                        <div className="max-w-[16rem] text-slate-500">Lic: {dp.licenseNote ?? "—"} · Seg: {dp.insuranceNote ?? "—"} · Insp: {dp.inspectionNote ?? "—"}</div>
                        {u.status !== "deleted" && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {dp.verificationStatus !== "approved" && <AdminAction url={url} body={{ action: "verify_driver", status: "approved" }} label="Aprobar" tone="success" />}
                            {dp.verificationStatus !== "rejected" && <AdminAction url={url} body={{ action: "verify_driver", status: "rejected" }} label="Rechazar" tone="danger" reason />}
                            {dp.verificationStatus === "approved" && <AdminAction url={url} body={{ action: "verify_driver", status: "expired" }} label="Marcar vencido" tone="warning" reason />}
                          </div>
                        )}
                      </>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-2 py-2"><RatingBadge avg={r?.avg} count={r?.count} /></td>
                  <td className="whitespace-nowrap px-2 py-2 text-xs text-slate-600">
                    {u._count.tripOffers} ofertas · {u._count.tripRequests} solic.<br />
                    {u._count.dealsAsDriver + u._count.dealsAsRequester} acuerdos
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-xs text-slate-600">{formatDate(u.createdAt)}</td>
                  <td className="px-2 py-2">
                    <div className="mb-1">
                      <AdminAction url={url} body={{ action: "revoke_mobile_sessions" }} label="Cerrar sesiones móviles" tone="warning" confirm />
                    </div>
                    {u.role !== "admin" && u.status !== "deleted" && (
                      <div className="flex flex-wrap gap-1">
                        {u.status !== "active" && <AdminAction url={url} body={{ action: "set_status", status: "active" }} label="Reactivar" tone="success" />}
                        {u.status !== "payment_hold" && <AdminAction url={url} body={{ action: "set_status", status: "payment_hold" }} label="En espera por pago" tone="warning" reason />}
                        {u.status !== "suspended" && <AdminAction url={url} body={{ action: "set_status", status: "suspended" }} label="Suspender" tone="danger" reason />}
                        <AdminAction url={url} body={{ action: "delete" }} label="Eliminar cuenta" tone="danger" reason />
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        <strong>En espera por pago:</strong> puede entrar y terminar sus viajes en curso, pero no publicar ni cerrar acuerdos nuevos; sus anuncios se ocultan.
        <strong> Suspendido:</strong> se cierra su sesión y no puede hacer nada. <strong>Eliminar:</strong> se anonimiza la cuenta, se cancelan sus anuncios y acuerdos sin pagar; los acuerdos pagados quedan para el registro.
      </p>
    </div>
  )
}

import { db } from "@/lib/db"
import { formatDateTime } from "@/lib/format"

export default async function AdminLogPage() {
  const logs = await db.adminLog.findMany({ include: { admin: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 300 })
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Registro de acciones de administración</h1>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800 text-left text-xs uppercase text-slate-100"><tr><th className="px-2 py-2">Fecha</th><th className="px-2 py-2">Admin</th><th className="px-2 py-2">Acción</th><th className="px-2 py-2">Objeto</th><th className="px-2 py-2">Nota</th></tr></thead>
          <tbody>
            {logs.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">Todavía no hay acciones.</td></tr>}
            {logs.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="whitespace-nowrap px-2 py-1.5">{formatDateTime(l.createdAt)}</td>
                <td className="px-2 py-1.5">{l.admin.name ?? l.admin.email}</td>
                <td className="px-2 py-1.5 font-mono text-xs">{l.action}</td>
                <td className="px-2 py-1.5 font-mono text-xs">{l.targetType}:{l.targetId.slice(-8)}</td>
                <td className="px-2 py-1.5 text-slate-600">{l.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

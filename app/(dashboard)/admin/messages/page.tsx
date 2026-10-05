import { db } from "@/lib/db"
import { formatDateTime } from "@/lib/format"
import AdminAction from "../AdminAction"

const TOPIC: Record<string, string> = { general: "General", driver: "Quiero ser conductor", business: "Empresa", support: "Ayuda con un viaje", privacy: "Privacidad / mis datos", other: "Otro" }

export default async function AdminMessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: [{ read: "asc" }, { createdAt: "desc" }], take: 300 })
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mensajes de contacto</h1>
      <p className="text-sm text-slate-600">También llegan por correo al admin. Para responder, escribe al correo de la persona.</p>
      {messages.length === 0 ? <p className="text-sm text-slate-500">No hay mensajes.</p> : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className={`rounded-lg border bg-white p-4 ${m.read ? "opacity-60" : "border-blue-300"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span><strong>{m.name}</strong> · <a href={`mailto:${m.email}`} className="text-blue-700 underline">{m.email}</a> · {TOPIC[m.topic] ?? m.topic} · {m.lang.toUpperCase()}</span>
                <span className="text-xs text-slate-500">{formatDateTime(m.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{m.message}</p>
              <div className="mt-2 flex gap-2">
                <AdminAction url={`/api/admin/messages/${m.id}`} body={{ action: m.read ? "unread" : "read" }} label={m.read ? "Marcar no leído" : "Marcar leído"} />
                <AdminAction url={`/api/admin/messages/${m.id}`} method="DELETE" label="Borrar" tone="danger" confirm />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

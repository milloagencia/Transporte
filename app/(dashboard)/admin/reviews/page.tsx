import Link from "next/link"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/format"
import { Stars } from "@/components/stars"
import AdminAction from "../AdminAction"

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const sp = await searchParams
  const filter = sp.filter ?? "pending"
  const where =
    filter === "pending" ? { commentStatus: "pending" as const, comment: { not: null } } :
    filter === "low" ? { stars: { lte: 2 } } :
    filter === "hidden" ? { hidden: true } : {}
  const reviews = await db.review.findMany({
    where,
    include: { author: { select: { id: true, name: true } }, subject: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  })
  const link = (f: string, label: string) => (
    <Link href={`/admin/reviews?filter=${f}`} className={`rounded-md px-3 py-1.5 text-sm ${filter === f ? "bg-slate-800 text-white" : "border bg-white"}`}>{label}</Link>
  )
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Calificaciones y comentarios</h1>
      <div className="flex flex-wrap gap-2">
        {link("pending", "Comentarios por revisar")}{link("low", "1–2 estrellas")}{link("hidden", "Ocultas")}{link("all", "Todas")}
      </div>
      <div className="rounded-lg border bg-blue-50 p-3 text-sm text-slate-700">
        <strong>Cómo funciona:</strong> las <em>estrellas</em> cuentan en el promedio cuando ambas partes califican (o a los 14 días).
        El <em>comentario</em> solo se publica si lo apruebas. <strong>Ocultar</strong> quita la calificación completa del promedio (úsalo para fraude, insultos o calificaciones falsas).
        Recomendación: rechaza comentarios con insultos, datos personales (teléfonos, direcciones), discriminación o temas que no tengan que ver con el viaje; no rechaces críticas honestas solo por ser negativas.
      </div>
      {reviews.length === 0 ? <p className="text-sm text-slate-500">No hay nada aquí.</p> : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className={`rounded-lg border bg-white p-3 ${r.hidden ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <Link href={`/users/${r.author.id}`} className="font-medium hover:underline">{r.author.name ?? "—"}</Link>
                  {" "}({r.authorRole === "driver" ? "conductor" : "cliente"}) → <Link href={`/users/${r.subject.id}`} className="font-medium hover:underline">{r.subject.name ?? "—"}</Link>
                  {" "}· <Link href={`/deals/${r.dealId}`} className="text-blue-700 hover:underline">acuerdo</Link> · {formatDate(r.createdAt)}
                </span>
                <Stars value={r.stars} />
              </div>
              {r.comment ? <p className="mt-2 text-sm text-slate-800">“{r.comment}”</p> : <p className="mt-2 text-xs text-slate-400">Sin comentario</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500">Comentario: <strong>{r.commentStatus}</strong>{r.hidden && " · OCULTA"}{r.moderationNote && ` · nota: ${r.moderationNote}`}</span>
                {r.comment && r.commentStatus !== "approved" && <AdminAction url={`/api/admin/reviews/${r.id}`} body={{ action: "approve" }} label="Publicar comentario" tone="success" />}
                {r.comment && r.commentStatus !== "rejected" && <AdminAction url={`/api/admin/reviews/${r.id}`} body={{ action: "reject" }} label="Rechazar comentario" tone="warning" reason />}
                {!r.hidden ? <AdminAction url={`/api/admin/reviews/${r.id}`} body={{ action: "hide" }} label="Ocultar calificación" tone="danger" reason />
                  : <AdminAction url={`/api/admin/reviews/${r.id}`} body={{ action: "unhide" }} label="Mostrar de nuevo" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

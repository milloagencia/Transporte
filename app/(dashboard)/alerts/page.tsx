import Link from "next/link"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/guards"
import { formatDate } from "@/lib/format"
import AlertRowActions from "@/components/alert-row-actions"

export default async function AlertsPage() {
  const me = await getSessionUser()
  if (!me) redirect("/auth/signin")
  const t = await getTranslations("alerts")
  const tt = await getTranslations("trip")
  const alerts = await db.tripAlert.findMany({ where: { userId: me.id }, orderBy: [{ active: "desc" }, { createdAt: "desc" }] })
  const place = (c: string | null, s: string | null) => (c ? `${c}${s ? `, ${s}` : ""}` : s ?? t("any"))

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-sm text-slate-600">{t("help")}</p>
      {alerts.length === 0 ? <p className="text-slate-500">{t("none")}</p> : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li key={a.id} className={`rounded-lg border bg-white p-4 ${a.active ? "" : "opacity-60"}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">
                    {place(a.originCity, a.originState)} → {place(a.destCity, a.destState)}
                    {a.radiusMiles > 0 && <span className="font-normal text-slate-500"> · {t("radius")} {a.radiusMiles} mi</span>}
                  </p>
                  <p className="text-slate-600">
                    {t(`kind_${a.kind}`)}
                    {a.serviceType && ` · ${tt(a.serviceType)}`}
                    {a.dateFrom && ` · ${formatDate(a.dateFrom)}`}{a.dateTo && ` – ${formatDate(a.dateTo)}`}
                  </p>
                  {a.requestId && <p><Link href={`/requests/${a.requestId}`} className="text-blue-700 hover:underline">{t("forRequest")}</Link></p>}
                  <p className="text-xs text-slate-500">{a.active ? t("active") : t("paused")} · {t("sent")}: {a.matchesSent}</p>
                </div>
                <AlertRowActions id={a.id} active={a.active} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

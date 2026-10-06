import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import type { SessionUser } from "@/lib/guards"

/** Checklist on the dashboard, depending on what the user said they want to do. */
export default async function NextSteps({ me, welcome }: { me: SessionUser; welcome: boolean }) {
  const t = await getTranslations("dash")
  const [vehicles, profile, offers, requests, alerts] = await Promise.all([
    db.vehicle.count({ where: { ownerId: me.id, active: true } }),
    db.driverProfile.findUnique({ where: { userId: me.id }, select: { verificationStatus: true } }),
    db.tripOffer.count({ where: { driverId: me.id } }),
    db.tripRequest.count({ where: { requesterId: me.id } }),
    db.tripAlert.count({ where: { userId: me.id, active: true } }),
  ])
  const steps: { done: boolean; label: string; href: string }[] = []
  if (me.wantsToDrive) {
    steps.push({ done: vehicles > 0, label: t("stepVehicle"), href: "/vehicles" })
    const v = profile?.verificationStatus
    steps.push(
      v === "approved" ? { done: true, label: t("stepVerified"), href: "/profile" }
      : v === "pending" ? { done: false, label: t("stepWaiting"), href: "/profile" }
      : { done: false, label: t("stepVerify"), href: "/profile" },
    )
    steps.push({ done: offers > 0, label: t("stepPostOffer"), href: "/offers/new" })
    steps.push({ done: false, label: t("stepBrowseRequests"), href: "/requests" })
  }
  if (me.wantsToShip) {
    steps.push({ done: requests > 0, label: t("stepPostRequest"), href: "/requests/new" })
    steps.push({ done: false, label: t("stepBrowseOffers"), href: "/offers" })
    steps.push({ done: alerts > 0, label: t("stepAlert"), href: "/offers" })
  }
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      {welcome && <p className="mb-2 font-semibold text-blue-900">{t("welcome")}</p>}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{t("nextSteps")}</p>
        <Link href="/onboarding" className="text-xs text-blue-700 hover:underline">{t("editAccount")}</Link>
      </div>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className={`flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm hover:shadow ${s.done ? "text-slate-400 line-through" : "text-slate-800"}`}>
              <span className={s.done ? "text-emerald-600" : "text-blue-600"}>{s.done ? "✓" : "→"}</span>{s.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

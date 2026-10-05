import Nav from "@/components/nav"
import { getTranslations } from "next-intl/server"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/guards"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getSessionUser()
  // New accounts first choose what they want to do (need transport / offer transport, person / company)
  if (me && !me.onboarded) redirect("/onboarding")
  const t = await getTranslations("account")
  const account = me && me.status !== "active" ? await db.user.findUnique({ where: { id: me.id }, select: { status: true, statusReason: true } }) : null
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      {account && (account.status === "payment_hold" || account.status === "suspended") && (
        <div className={account.status === "suspended" ? "bg-red-600 text-white" : "bg-amber-400 text-amber-950"}>
          <div className="mx-auto max-w-7xl px-4 py-2 text-sm">
            {t(account.status)}
            {account.statusReason && <span className="ml-1 opacity-90">({t("reason")}: {account.statusReason})</span>}
          </div>
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

import Link from "next/link"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/guards"
import { db } from "@/lib/db"
import AutoRefresh from "./AutoRefresh"

const TABS = [
  ["/admin", "Resumen"],
  ["/admin/users", "Usuarios"],
  ["/admin/trips", "Ofertas y solicitudes"],
  ["/admin/deals", "Acuerdos"],
  ["/admin/reviews", "Calificaciones"],
  ["/admin/messages", "Mensajes"],
  ["/admin/log", "Registro"],
] as const

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await getSessionUser()
  if (me?.role !== "admin") redirect("/dashboard")
  const [pendingReviews, pendingDrivers, unreadMessages] = await Promise.all([
    db.review.count({ where: { commentStatus: "pending", comment: { not: null } } }),
    db.driverProfile.count({ where: { verificationStatus: "pending" } }),
    db.contactMessage.count({ where: { read: false } }),
  ])
  const badge = (href: string) => (href === "/admin/reviews" ? pendingReviews : href === "/admin/users" ? pendingDrivers : href === "/admin/messages" ? unreadMessages : 0)
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1 border-b border-slate-200">
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-t-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            {label}
            {badge(href) > 0 && <span className="ml-1 rounded-full bg-red-600 px-1.5 text-[11px] text-white">{badge(href)}</span>}
          </Link>
        ))}
        <span className="ml-auto pb-1"><AutoRefresh /></span>
      </nav>
      {children}
    </div>
  )
}

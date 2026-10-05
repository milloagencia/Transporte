"use client"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export type SortDir = "asc" | "desc"
export type Sort<K extends string> = { key: K; dir: SortDir }

const TZ = "America/Chicago"

/** "Oct 6, 7:00 AM" in Nebraska time. */
export const shortDateTime = (iso: string, locale: string) =>
  new Date(iso).toLocaleString(locale === "es" ? "es-US" : "en-US", { timeZone: TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })

/** Time since posting: 5m, 3h, 2d. */
export function age(iso: string) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  return h < 48 ? `${h}h` : `${Math.round(h / 24)}d`
}

/** Compare helper that keeps empty values at the end. */
export function compare(a: number | string | null | undefined, b: number | string | null | undefined, dir: SortDir) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  const r = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b))
  return dir === "asc" ? r : -r
}

export function SortTh<K extends string>({ label, k, sort, onSort, className }: { label: string; k: K; sort: Sort<K>; onSort: (s: Sort<K>) => void; className?: string }) {
  const active = sort.key === k
  return (
    <th className={cn("sticky top-0 z-10 whitespace-nowrap bg-slate-800 px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-100", className)}>
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-white"
        onClick={() => onSort({ key: k, dir: active && sort.dir === "asc" ? "desc" : "asc" })}
      >
        {label}
        <span className={cn("text-[10px]", active ? "opacity-100" : "opacity-30")}>{active && sort.dir === "desc" ? "▼" : "▲"}</span>
      </button>
    </th>
  )
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1 text-xs font-medium text-slate-600", className)}>
      {label}
      {children}
    </label>
  )
}

export const inputCls = "h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"

export function ColdBadge({ value }: { value: string }) {
  const t = useTranslations("vehicles")
  if (value === "none") return <span className="text-slate-400">—</span>
  return (
    <span className={cn("whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium", value === "active_refrigeration" ? "bg-cyan-100 text-cyan-800" : "bg-sky-50 text-sky-700")}>
      {t(`cold_${value}`)}
    </span>
  )
}

export function ServiceBadge({ value }: { value: string }) {
  const t = useTranslations("trip")
  const cls = value === "people" ? "bg-violet-100 text-violet-800" : value === "cargo" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
  return <span className={cn("whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium", cls)}>{t(value)}</span>
}

"use client"
import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { coordsOf, roadMiles } from "@/lib/geo"
import { matchOfferToRequest } from "@/lib/matching"
import { US_STATES } from "@/lib/validation"
import { RatingBadge } from "@/components/stars"
import AlertButton from "@/components/alert-button"
import { ColdBadge, Field, ServiceBadge, SortTh, age, compare, inputCls, shortDateTime, type Sort } from "./board-ui"

export type RequestRow = {
  id: string
  createdAt: string
  from: string
  to: string
  originCity: string
  originState: string
  destCity: string
  destState: string
  serviceType: "people" | "cargo"
  passengerCount: number | null
  cargoWeightLbs: number | null
  cargoLengthIn: number | null
  cargoWidthIn: number | null
  cargoHeightIn: number | null
  cargoPieces: number | null
  cargoDesc: string | null
  coldChainRequired: "none" | "cooler_ice" | "active_refrigeration"
  budget: number | null
  requesterName: string
  requesterId: string
  ratingAvg: number | null
  ratingCount: number
  mine: boolean
}

export type MyVehicle = {
  id: string
  label: string
  seats: number
  payloadLbs: number
  cargoLengthIn: number
  cargoWidthIn: number
  cargoHeightIn: number | null
  openTop: boolean
  coldChain: "none" | "cooler_ice" | "active_refrigeration"
}

type Key = "age" | "from" | "dho" | "origin" | "dest" | "miles" | "load" | "weight" | "budget" | "rpm" | "requester"
const RADII = [0, 25, 50, 100, 200]
const PAGE = 50

const empty = {
  origin: "", originState: "", radius: "0", dest: "", destState: "", dateFrom: "", dateTo: "",
  service: "", cold: "", maxWeight: "", minBudget: "", vehicleId: "", mineOnly: false,
}

const POLL_MS = 30_000

export default function RequestsBoard({ rows: initialRows, vehicles, loadedAt }: { rows: RequestRow[]; vehicles: MyVehicle[]; loadedAt: string }) {
  const t = useTranslations("board")
  const tt = useTranslations("trip")
  const tv = useTranslations("vehicles")
  const locale = useLocale()
  const router = useRouter()
  const [f, setF] = useState(empty)
  const [sort, setSort] = useState<Sort<Key>>({ key: "from", dir: "asc" })
  const [limit, setLimit] = useState(PAGE)
  const set = (k: keyof typeof empty, v: string | boolean) => { setF((x) => ({ ...x, [k]: v })); setLimit(PAGE) }

  const [rows, setRows] = useState(initialRows)
  const [pending, setPending] = useState<RequestRow[]>([])
  const [since, setSince] = useState(loadedAt)

  const searchOrigin = useMemo(() => (f.origin ? coordsOf(f.origin, f.originState || "NE") : null), [f.origin, f.originState])
  const vehicle = vehicles.find((v) => v.id === f.vehicleId)

  const enrich = useCallback((r: RequestRow) => {
    const o = coordsOf(r.originCity, r.originState)
    const miles = roadMiles(o, coordsOf(r.destCity, r.destState))
    const dho = searchOrigin ? roadMiles(searchOrigin, o) : null
    return { ...r, miles, dho, rpm: miles && r.budget ? r.budget / miles : null }
  }, [searchOrigin])

  const passes = useCallback((r: ReturnType<typeof enrich>) => {
    const radius = Number(f.radius)
    const has = (s: string, q: string) => s.toLowerCase().includes(q.trim().toLowerCase())
    {
      if (f.mineOnly && !r.mine) return false
      if (f.origin) {
        const near = radius > 0 && r.dho != null && r.dho <= radius
        if (!near && !has(r.originCity, f.origin)) return false
      }
      if (f.originState && r.originState !== f.originState) return false
      if (f.dest && !has(r.destCity, f.dest)) return false
      if (f.destState && r.destState !== f.destState) return false
      if (f.dateFrom && new Date(r.to) < new Date(f.dateFrom + "T00:00")) return false
      if (f.dateTo && new Date(r.from) > new Date(f.dateTo + "T23:59")) return false
      if (f.service && r.serviceType !== f.service) return false
      if (f.cold === "needs" && r.coldChainRequired === "none") return false
      if (f.cold === "no" && r.coldChainRequired !== "none") return false
      if (f.maxWeight && (r.cargoWeightLbs ?? 0) > Number(f.maxWeight)) return false
      if (f.minBudget && (r.budget ?? 0) < Number(f.minBudget)) return false
      if (vehicle) {
        const fit = matchOfferToRequest(
          {
            serviceType: "mixed", seats: vehicle.seats, cargoWeightLbs: vehicle.payloadLbs,
            cargoLengthIn: vehicle.cargoLengthIn, cargoWidthIn: vehicle.cargoWidthIn, cargoHeightIn: vehicle.cargoHeightIn,
            openTop: vehicle.openTop, coldChain: vehicle.coldChain,
          },
          r,
        )
        if (!fit.ok) return false
      }
      return true
    }
  }, [f, vehicle])

  // Every 30 s, look for requests posted since the last load (only while the tab is visible)
  useEffect(() => {
    const tick = async () => {
      if (document.visibilityState !== "visible") return
      const res = await fetch(`/api/requests/updates?since=${encodeURIComponent(since)}`).catch(() => null)
      if (!res?.ok) return
      const data = (await res.json()) as { now: string; rows: RequestRow[] }
      setSince(data.now)
      if (data.rows.length) setPending((p) => [...p, ...data.rows.filter((n) => !p.some((x) => x.id === n.id))])
    }
    const id = setInterval(tick, POLL_MS)
    return () => clearInterval(id)
  }, [since])

  const pendingMatching = useMemo(() => pending.map(enrich).filter(passes).length, [pending, enrich, passes])
  const showPending = () => {
    setRows((r) => [...pending.filter((p) => !r.some((x) => x.id === p.id)), ...r])
    setPending([])
  }

  const view = useMemo(() => {
    const enriched = rows.map(enrich)
    const filtered = enriched.filter(passes)
    const val = (r: (typeof enriched)[number]): number | string | null => {
      switch (sort.key) {
        case "age": return -new Date(r.createdAt).getTime()
        case "from": return new Date(r.from).getTime()
        case "dho": return r.dho
        case "origin": return `${r.originCity} ${r.originState}`
        case "dest": return `${r.destCity} ${r.destState}`
        case "miles": return r.miles
        case "load": return r.serviceType === "people" ? r.passengerCount : r.cargoPieces
        case "weight": return r.cargoWeightLbs
        case "budget": return r.budget
        case "rpm": return r.rpm
        case "requester": return r.requesterName
      }
    }
    return filtered.sort((a, b) => compare(val(a), val(b), sort.dir))
  }, [rows, sort, enrich, passes])

  const th = (label: string, k: Key, className?: string) => <SortTh label={label} k={k} sort={sort} onSort={setSort} className={className} />
  const plainTh = (label: string) => <th className="sticky top-0 z-10 whitespace-nowrap bg-slate-800 px-2 py-2 text-left text-xs font-semibold uppercase text-slate-100">{label}</th>

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
          <Field label={t("origin")}><input className={inputCls} value={f.origin} onChange={(e) => set("origin", e.target.value)} placeholder="Omaha" /></Field>
          <Field label={t("state")}>
            <select className={inputCls} value={f.originState} onChange={(e) => set("originState", e.target.value)}>
              <option value="">{t("all")}</option>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label={t("radius")}>
            <select className={inputCls} value={f.radius} onChange={(e) => set("radius", e.target.value)} disabled={!f.origin}>
              {RADII.map((r) => <option key={r} value={r}>{r === 0 ? t("exactCity") : `${r} mi`}</option>)}
            </select>
          </Field>
          <Field label={t("destination")}><input className={inputCls} value={f.dest} onChange={(e) => set("dest", e.target.value)} placeholder="Lincoln" /></Field>
          <Field label={t("state")}>
            <select className={inputCls} value={f.destState} onChange={(e) => set("destState", e.target.value)}>
              <option value="">{t("all")}</option>
              {US_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label={t("dateFrom")}><input type="date" className={inputCls} value={f.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} /></Field>
          <Field label={t("dateTo")}><input type="date" className={inputCls} value={f.dateTo} onChange={(e) => set("dateTo", e.target.value)} /></Field>
          <Field label={tt("service")}>
            <select className={inputCls} value={f.service} onChange={(e) => set("service", e.target.value)}>
              <option value="">{t("all")}</option>
              <option value="people">{tt("people")}</option>
              <option value="cargo">{tt("cargo")}</option>
            </select>
          </Field>
          <Field label={tv("coldChain")}>
            <select className={inputCls} value={f.cold} onChange={(e) => set("cold", e.target.value)}>
              <option value="">{t("all")}</option>
              <option value="needs">{t("coldNeeds")}</option>
              <option value="no">{t("coldNo")}</option>
            </select>
          </Field>
          <Field label={t("maxWeight")}><input type="number" min={1} className={inputCls} value={f.maxWeight} onChange={(e) => set("maxWeight", e.target.value)} /></Field>
          <Field label={t("minBudget")}><input type="number" min={1} className={inputCls} value={f.minBudget} onChange={(e) => set("minBudget", e.target.value)} /></Field>
          <Field label={t("fitsVehicle")} className="col-span-2">
            <select className={inputCls} value={f.vehicleId} onChange={(e) => set("vehicleId", e.target.value)} disabled={vehicles.length === 0}>
              <option value="">{vehicles.length === 0 ? t("noVehicles") : t("anyVehicle")}</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
            <input type="checkbox" checked={f.mineOnly} onChange={(e) => set("mineOnly", e.target.checked)} /> {t("mineOnly")}
          </label>
          <div className="flex items-end gap-2">
            <button type="button" className="h-9 rounded-md border border-slate-300 px-3 text-sm hover:bg-slate-50" onClick={() => setF(empty)}>{t("clear")}</button>
            <span className="pb-2 text-sm text-slate-600">{t("results", { count: view.length })}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {pendingMatching > 0 ? (
          <button type="button" onClick={showPending} className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700">
            ↑ {t("newRows", { count: pendingMatching })}
          </button>
        ) : <span className="text-xs text-slate-400">{t("liveHint")}</span>}
        <AlertButton
          label={t("alertRequests")}
          payload={() => ({
            kind: "requests", originCity: f.origin || null, originState: f.originState || (f.origin ? "NE" : null),
            radiusMiles: Number(f.radius) || 0, destCity: f.dest || null, destState: f.destState || null,
            dateFrom: f.dateFrom || null, dateTo: f.dateTo || null, serviceType: f.service || null, vehicleId: f.vehicleId || null,
          })}
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {th(t("age"), "age")}
              {th(t("pickup"), "from")}
              {searchOrigin && th("DH-O", "dho")}
              {th(t("origin"), "origin")}
              {th(t("destination"), "dest")}
              {th(t("miles"), "miles")}
              {plainTh(t("type"))}
              {th(t("load"), "load")}
              {th(t("weight"), "weight")}
              {plainTh(t("size"))}
              {plainTh(t("cold"))}
              {th(t("budget"), "budget", "text-right")}
              {th("$/mi", "rpm", "text-right")}
              {th(t("requester"), "requester")}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 && (
              <tr><td colSpan={14} className="px-3 py-8 text-center text-slate-500">{t("noResults")}</td></tr>
            )}
            {view.slice(0, limit).map((r, i) => (
              <tr
                key={r.id}
                onClick={() => router.push(`/requests/${r.id}`)}
                title={r.cargoDesc ?? undefined}
                className={`cursor-pointer border-t border-slate-100 hover:bg-blue-50 ${i % 2 ? "bg-slate-50/60" : ""} ${r.mine ? "border-l-4 border-l-blue-500" : ""}`}
              >
                <td className="px-2 py-1.5 text-slate-500">{age(r.createdAt)}</td>
                <td className="whitespace-nowrap px-2 py-1.5">{shortDateTime(r.from, locale)}</td>
                {searchOrigin && <td className="px-2 py-1.5 text-slate-600">{r.dho ?? "—"}</td>}
                <td className="whitespace-nowrap px-2 py-1.5 font-medium">{r.originCity}, {r.originState}</td>
                <td className="whitespace-nowrap px-2 py-1.5 font-medium">{r.destCity}, {r.destState}</td>
                <td className="px-2 py-1.5 text-slate-600">{r.miles ? `≈${r.miles}` : "—"}</td>
                <td className="px-2 py-1.5"><ServiceBadge value={r.serviceType} /></td>
                <td className="whitespace-nowrap px-2 py-1.5">
                  {r.serviceType === "people" ? `${r.passengerCount ?? 1} pax` : `${r.cargoPieces ?? 1} ${t("pieces")}`}
                </td>
                <td className="whitespace-nowrap px-2 py-1.5">{r.cargoWeightLbs ? `${Math.round(r.cargoWeightLbs).toLocaleString()} lb` : "—"}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">
                  {r.cargoLengthIn ? `${Math.round(r.cargoLengthIn)}×${Math.round(r.cargoWidthIn ?? 0)}×${Math.round(r.cargoHeightIn ?? 0)}` : "—"}
                </td>
                <td className="px-2 py-1.5"><ColdBadge value={r.coldChainRequired} /></td>
                <td className="px-2 py-1.5 text-right font-semibold text-emerald-700">{r.budget ? `$${r.budget.toLocaleString()}` : "—"}</td>
                <td className="px-2 py-1.5 text-right text-slate-600">{r.rpm ? `$${r.rpm.toFixed(2)}` : "—"}</td>
                <td className="whitespace-nowrap px-2 py-1.5">
                  <Link href={`/users/${r.requesterId}`} onClick={(e) => e.stopPropagation()} className="text-blue-700 hover:underline">{r.requesterName}</Link>{" "}<RatingBadge avg={r.ratingAvg ?? undefined} count={r.ratingCount} empty="" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {view.length > limit && (
        <div className="text-center">
          <button type="button" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setLimit((l) => l + PAGE)}>{t("showMore")}</button>
        </div>
      )}
      <p className="text-xs text-slate-500">{t("milesNote")}</p>
    </div>
  )
}

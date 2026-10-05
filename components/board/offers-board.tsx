"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { coordsOf, roadMiles } from "@/lib/geo"
import { US_STATES } from "@/lib/validation"
import { RatingBadge } from "@/components/stars"
import AlertButton from "@/components/alert-button"
import { ColdBadge, Field, ServiceBadge, SortTh, age, compare, inputCls, shortDateTime, type Sort } from "./board-ui"

export type OfferRow = {
  id: string
  createdAt: string
  from: string
  to: string
  originCity: string
  originState: string
  destCity: string
  destState: string
  serviceType: string
  exclusivity: string
  seats: number | null
  cargoWeightLbs: number | null
  cargoLengthIn: number | null
  cargoWidthIn: number | null
  cargoHeightIn: number | null
  openTop: boolean
  coldChain: string
  rate: number
  driverName: string
  driverId: string
  ratingAvg: number | null
  ratingCount: number
  vehicleLabel: string | null
  vehicleCategory: string | null
  mine: boolean
}

type Key = "age" | "from" | "dho" | "origin" | "dest" | "miles" | "vehicle" | "seats" | "weight" | "rate" | "rpm" | "driver"

const CATEGORIES = ["sedan", "suv", "suv_3row", "minivan", "pickup", "cargo_van", "passenger_van", "box_truck", "trailer", "other"]
const RADII = [0, 25, 50, 100, 200]
const PAGE = 50

const empty = {
  origin: "", originState: "", radius: "0", dest: "", destState: "", dateFrom: "", dateTo: "",
  service: "", category: "", cold: "", minSeats: "", minWeight: "", maxRate: "", mineOnly: false,
}

export default function OffersBoard({ rows }: { rows: OfferRow[] }) {
  const t = useTranslations("board")
  const tt = useTranslations("trip")
  const tv = useTranslations("vehicles")
  const locale = useLocale()
  const router = useRouter()
  const [f, setF] = useState(empty)
  const [sort, setSort] = useState<Sort<Key>>({ key: "from", dir: "asc" })
  const [limit, setLimit] = useState(PAGE)
  const set = (k: keyof typeof empty, v: string | boolean) => { setF((x) => ({ ...x, [k]: v })); setLimit(PAGE) }

  const searchOrigin = f.origin ? coordsOf(f.origin, f.originState || "NE") : null

  const view = useMemo(() => {
    const radius = Number(f.radius)
    const enriched = rows.map((r) => {
      const o = coordsOf(r.originCity, r.originState)
      const miles = roadMiles(o, coordsOf(r.destCity, r.destState))
      const dho = searchOrigin ? roadMiles(searchOrigin, o) : null
      return { ...r, miles, dho, rpm: miles ? r.rate / miles : null }
    })
    const has = (s: string, q: string) => s.toLowerCase().includes(q.trim().toLowerCase())
    const filtered = enriched.filter((r) => {
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
      if (f.service && r.serviceType !== f.service && !(r.serviceType === "mixed" && f.service !== "mixed")) return false
      if (f.category && r.vehicleCategory !== f.category) return false
      if (f.cold === "any" && r.coldChain === "none") return false
      if (f.cold === "active" && r.coldChain !== "active_refrigeration") return false
      if (f.minSeats && (r.seats ?? 0) < Number(f.minSeats)) return false
      if (f.minWeight && (r.cargoWeightLbs ?? 0) < Number(f.minWeight)) return false
      if (f.maxRate && r.rate > Number(f.maxRate)) return false
      return true
    })
    const val = (r: (typeof enriched)[number]): number | string | null => {
      switch (sort.key) {
        case "age": return -new Date(r.createdAt).getTime()
        case "from": return new Date(r.from).getTime()
        case "dho": return r.dho
        case "origin": return `${r.originCity} ${r.originState}`
        case "dest": return `${r.destCity} ${r.destState}`
        case "miles": return r.miles
        case "vehicle": return r.vehicleLabel
        case "seats": return r.seats
        case "weight": return r.cargoWeightLbs
        case "rate": return r.rate
        case "rpm": return r.rpm
        case "driver": return r.driverName
      }
    }
    return filtered.sort((a, b) => compare(val(a), val(b), sort.dir))
  }, [rows, f, sort, searchOrigin])

  const th = (label: string, k: Key, className?: string) => <SortTh label={label} k={k} sort={sort} onSort={setSort} className={className} />

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
              <option value="mixed">{tt("mixed")}</option>
            </select>
          </Field>
          <Field label={t("vehicleType")}>
            <select className={inputCls} value={f.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">{t("all")}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{tv(`cat_${c}`)}</option>)}
            </select>
          </Field>
          <Field label={tv("coldChain")}>
            <select className={inputCls} value={f.cold} onChange={(e) => set("cold", e.target.value)}>
              <option value="">{t("all")}</option>
              <option value="any">{t("coldAny")}</option>
              <option value="active">{tv("cold_active_refrigeration")}</option>
            </select>
          </Field>
          <Field label={t("minSeats")}><input type="number" min={1} className={inputCls} value={f.minSeats} onChange={(e) => set("minSeats", e.target.value)} /></Field>
          <Field label={t("minWeight")}><input type="number" min={1} className={inputCls} value={f.minWeight} onChange={(e) => set("minWeight", e.target.value)} /></Field>
          <Field label={t("maxRate")}><input type="number" min={1} className={inputCls} value={f.maxRate} onChange={(e) => set("maxRate", e.target.value)} /></Field>
          <label className="flex items-end gap-2 pb-2 text-sm text-slate-700">
            <input type="checkbox" checked={f.mineOnly} onChange={(e) => set("mineOnly", e.target.checked)} /> {t("mineOnly")}
          </label>
          <div className="col-span-2 flex items-end gap-2 md:col-span-2">
            <button type="button" className="h-9 rounded-md border border-slate-300 px-3 text-sm hover:bg-slate-50" onClick={() => setF(empty)}>{t("clear")}</button>
            <span className="pb-2 text-sm text-slate-600">{t("results", { count: view.length })}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <AlertButton
          label={t("alertOffers")}
          payload={() => ({
            kind: "offers", originCity: f.origin || null, originState: f.originState || (f.origin ? "NE" : null),
            radiusMiles: Number(f.radius) || 0, destCity: f.dest || null, destState: f.destState || null,
            dateFrom: f.dateFrom || null, dateTo: f.dateTo || null, serviceType: f.service || null,
            passengers: f.minSeats ? Number(f.minSeats) : null, cargoWeightLbs: f.minWeight ? Number(f.minWeight) : null,
            coldChain: f.cold === "active" ? "active_refrigeration" : f.cold === "any" ? "cooler_ice" : "none",
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
              <th className="sticky top-0 z-10 bg-slate-800 px-2 py-2 text-left text-xs font-semibold uppercase text-slate-100">{t("type")}</th>
              {th(t("vehicle"), "vehicle")}
              {th(tt("seats"), "seats")}
              {th(t("weight"), "weight")}
              <th className="sticky top-0 z-10 whitespace-nowrap bg-slate-800 px-2 py-2 text-left text-xs font-semibold uppercase text-slate-100">{t("space")}</th>
              <th className="sticky top-0 z-10 bg-slate-800 px-2 py-2 text-left text-xs font-semibold uppercase text-slate-100">{t("cold")}</th>
              {th(t("rate"), "rate", "text-right")}
              {th("$/mi", "rpm", "text-right")}
              {th(t("driver"), "driver")}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 && (
              <tr><td colSpan={15} className="px-3 py-8 text-center text-slate-500">{t("noResults")}</td></tr>
            )}
            {view.slice(0, limit).map((r, i) => (
              <tr
                key={r.id}
                onClick={() => router.push(`/offers/${r.id}`)}
                className={`cursor-pointer border-t border-slate-100 hover:bg-blue-50 ${i % 2 ? "bg-slate-50/60" : ""} ${r.mine ? "border-l-4 border-l-blue-500" : ""}`}
              >
                <td className="px-2 py-1.5 text-slate-500">{age(r.createdAt)}</td>
                <td className="whitespace-nowrap px-2 py-1.5">{shortDateTime(r.from, locale)}</td>
                {searchOrigin && <td className="px-2 py-1.5 text-slate-600">{r.dho ?? "—"}</td>}
                <td className="whitespace-nowrap px-2 py-1.5 font-medium">{r.originCity}, {r.originState}</td>
                <td className="whitespace-nowrap px-2 py-1.5 font-medium">{r.destCity}, {r.destState}</td>
                <td className="px-2 py-1.5 text-slate-600">{r.miles ? `≈${r.miles}` : "—"}</td>
                <td className="px-2 py-1.5"><ServiceBadge value={r.serviceType} /></td>
                <td className="whitespace-nowrap px-2 py-1.5">{r.vehicleLabel ?? "—"}</td>
                <td className="px-2 py-1.5 text-center">{r.seats ?? "—"}</td>
                <td className="whitespace-nowrap px-2 py-1.5">{r.cargoWeightLbs ? `${Math.round(r.cargoWeightLbs).toLocaleString()} lb` : "—"}</td>
                <td className="whitespace-nowrap px-2 py-1.5 text-slate-600">
                  {r.cargoLengthIn ? `${Math.round(r.cargoLengthIn)}×${Math.round(r.cargoWidthIn ?? 0)}×${r.openTop || r.cargoHeightIn == null ? "∞" : Math.round(r.cargoHeightIn)}` : "—"}
                </td>
                <td className="px-2 py-1.5"><ColdBadge value={r.coldChain} /></td>
                <td className="px-2 py-1.5 text-right font-semibold text-emerald-700">${r.rate.toLocaleString()}</td>
                <td className="px-2 py-1.5 text-right text-slate-600">{r.rpm ? `$${r.rpm.toFixed(2)}` : "—"}</td>
                <td className="whitespace-nowrap px-2 py-1.5">
                  <Link href={`/users/${r.driverId}`} onClick={(e) => e.stopPropagation()} className="text-blue-700 hover:underline">{r.driverName}</Link>{" "}<RatingBadge avg={r.ratingAvg ?? undefined} count={r.ratingCount} empty="" />
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

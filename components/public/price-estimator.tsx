"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { KNOWN_CITIES, coordsOf, roadMiles } from "@/lib/geo"
import { estimate, type EstimateKind } from "@/lib/pricing"
import type { Lang } from "@/lib/seo-content"

const T = {
  es: { from: "Desde", to: "Hasta", what: "¿Qué necesitas?", pax: "Pasajeros", result: "Precio estimado", miles: "millas aprox.", per: "en total", note: "Es solo una referencia: el precio final lo acuerdas con el conductor y puede ser menor si compartes el viaje.", cta: "Publicar mi solicitud gratis", same: "Elige dos ciudades distintas.",
    kinds: { seat: "Viajar (asiento en viaje compartido)", small: "Cajas o paquetes (caben en un carro)", medium: "Muebles o electrodomésticos (pickup)", large: "Carga grande (van de carga)", move: "Mudanza (camión de caja)" } },
  en: { from: "From", to: "To", what: "What do you need?", pax: "Passengers", result: "Estimated price", miles: "miles approx.", per: "total", note: "This is only a reference: the final price is agreed with the driver and can be lower if you share the trip.", cta: "Post my request for free", same: "Choose two different cities.",
    kinds: { seat: "Travel (seat in a shared ride)", small: "Boxes or packages (fit in a car)", medium: "Furniture or appliances (pickup)", large: "Large cargo (cargo van)", move: "Move (box truck)" } },
}

const cities = [...KNOWN_CITIES].sort((a, b) => (a.state === "NE" ? 0 : 1) - (b.state === "NE" ? 0 : 1) || a.city.localeCompare(b.city))
const key = (c: { city: string; state: string }) => `${c.city}|${c.state}`
const sel = "mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"

export default function PriceEstimator({ lang }: { lang: Lang }) {
  const t = T[lang]
  const [from, setFrom] = useState("Omaha|NE")
  const [to, setTo] = useState("Lincoln|NE")
  const [kind, setKind] = useState<EstimateKind>("seat")
  const [pax, setPax] = useState(1)

  const result = useMemo(() => {
    if (from === to) return null
    const [fc, fs] = from.split("|")
    const [tc, ts] = to.split("|")
    const miles = roadMiles(coordsOf(fc, fs), coordsOf(tc, ts))
    return miles ? { miles, range: estimate(kind, miles, pax) } : null
  }, [from, to, kind, pax])

  return (
    <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">{t.from}
          <select className={sel} value={from} onChange={(e) => setFrom(e.target.value)}>{cities.map((c) => <option key={key(c)} value={key(c)}>{c.city}, {c.state}</option>)}</select>
        </label>
        <label className="text-sm font-medium">{t.to}
          <select className={sel} value={to} onChange={(e) => setTo(e.target.value)}>{cities.map((c) => <option key={key(c)} value={key(c)}>{c.city}, {c.state}</option>)}</select>
        </label>
        <label className="text-sm font-medium sm:col-span-2">{t.what}
          <select className={sel} value={kind} onChange={(e) => setKind(e.target.value as EstimateKind)}>
            {(Object.keys(t.kinds) as EstimateKind[]).map((k) => <option key={k} value={k}>{t.kinds[k]}</option>)}
          </select>
        </label>
        {kind === "seat" && (
          <label className="text-sm font-medium">{t.pax}
            <input type="number" min={1} max={8} className={sel} value={pax} onChange={(e) => setPax(Math.min(8, Math.max(1, Number(e.target.value) || 1)))} />
          </label>
        )}
      </div>
      <div className="mt-5 rounded-lg bg-blue-50 p-4" aria-live="polite">
        {result ? (
          <>
            <p className="text-sm text-blue-900">{t.result}</p>
            <p className="text-3xl font-bold text-blue-900">${result.range[0]} – ${result.range[1]} <span className="text-base font-normal">{t.per}</span></p>
            <p className="text-sm text-blue-900">≈ {result.miles} {t.miles}</p>
          </>
        ) : <p className="text-sm text-blue-900">{t.same}</p>}
        <p className="mt-2 text-xs text-slate-600">{t.note}</p>
      </div>
      <Link href={`/auth/signin?as=shipper&lang=${lang}`} className="mt-4 inline-block rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700">{t.cta}</Link>
    </div>
  )
}

// Display helpers for offers whose driver goes "wherever the customer needs" and/or charges per mile.

type DestLike = { destCity: string; destState: string; anyDestination?: boolean | null; maxTripMiles?: number | null }

export function destLabel(o: DestLike, lang: string = "es") {
  if (!o.anyDestination) return `${o.destCity}, ${o.destState}`
  const base = lang === "en" ? "Any destination" : "Cualquier destino"
  return o.maxTripMiles ? `${base} (≤${Math.round(o.maxTripMiles)} mi)` : base
}

export function rateLabel(rate: number, unit: string | null | undefined, lang: string = "es") {
  return unit === "mile" ? `$${rate.toFixed(2)}/${lang === "en" ? "mile" : "milla"}` : `$${rate.toLocaleString("en-US")}`
}

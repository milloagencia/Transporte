// Public price estimator. These are REFERENCE ranges to give people an idea before signing up;
// the real price is always agreed between driver and customer on the platform.
// Tune the numbers here (per-mile ranges and minimums) as real trips give better data.

export type EstimateKind = "seat" | "small" | "medium" | "large" | "move"

export const RATES: Record<EstimateKind, { perMile: [number, number]; min: [number, number] }> = {
  seat: { perMile: [0.22, 0.4], min: [12, 20] },       // one passenger seat in a shared ride
  small: { perMile: [0.5, 0.9], min: [30, 45] },       // boxes / packages that fit in a car
  medium: { perMile: [0.9, 1.5], min: [55, 85] },      // furniture or appliances (pickup / SUV)
  large: { perMile: [1.5, 2.5], min: [95, 150] },      // cargo van load
  move: { perMile: [2.5, 4.0], min: [180, 300] },      // apartment move (box truck)
}

const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5)

/** Price range for a trip of `miles` (per passenger when kind = seat). */
export function estimate(kind: EstimateKind, miles: number, passengers = 1): [number, number] {
  const r = RATES[kind]
  const lo = Math.max(r.min[0], miles * r.perMile[0])
  const hi = Math.max(r.min[1], miles * r.perMile[1])
  const n = kind === "seat" ? Math.max(1, passengers) : 1
  return [round5(lo * n), round5(hi * n)]
}

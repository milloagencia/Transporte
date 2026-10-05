// Capacity matching between a driver's offer and a requester's trip request.

export type Capacity = {
  serviceType: "people" | "cargo" | "mixed"
  seats: number | null
  cargoWeightLbs: number | null
  cargoLengthIn: number | null
  cargoWidthIn: number | null
  cargoHeightIn: number | null
  openTop: boolean
  coldChain: "none" | "cooler_ice" | "active_refrigeration"
}

export type Need = {
  serviceType: "people" | "cargo" | "mixed"
  passengerCount: number | null
  cargoWeightLbs: number | null
  cargoLengthIn: number | null
  cargoWidthIn: number | null
  cargoHeightIn: number | null
  coldChainRequired: "none" | "cooler_ice" | "active_refrigeration"
}

export type MatchResult = { ok: boolean; reasons: string[] }

/** Tallest load allowed above the floor of an open bed or flatbed (inches). */
export const OPEN_TOP_MAX_HEIGHT_IN = 72

const COLD_RANK = { none: 0, cooler_ice: 1, active_refrigeration: 2 } as const

/**
 * True if a box (l x w x h) fits in the space. The box may be rotated.
 * For open-top spaces (pickup beds, flatbeds) only the standing height is capped.
 */
export function boxFits(
  box: [number, number, number],
  space: { l: number; w: number; h: number | null; openTop: boolean },
): boolean {
  if (space.openTop || space.h == null) {
    // No roof: the box must fit on the floor using two of its sides,
    // and the third side (standing up) must stay below a safe height.
    const [a, b, c] = box
    const options: [number, number, number][] = [[a, b, c], [a, c, b], [b, c, a]]
    const [L, W] = [Math.max(space.l, space.w), Math.min(space.l, space.w)]
    return options.some(([x, y, up]) => Math.max(x, y) <= L && Math.min(x, y) <= W && up <= OPEN_TOP_MAX_HEIGHT_IN)
  }
  const b = [...box].sort((x, y) => y - x)
  const s = [space.l, space.w, space.h].sort((x, y) => y - x)
  return b[0] <= s[0] && b[1] <= s[1] && b[2] <= s[2]
}

export function matchOfferToRequest(offer: Capacity, req: Need): MatchResult {
  const reasons: string[] = []

  if (req.serviceType === "people") {
    if (offer.serviceType === "cargo") reasons.push("offer_cargo_only")
    const pax = req.passengerCount ?? 1
    if ((offer.seats ?? 0) < pax) reasons.push("not_enough_seats")
  } else {
    if (offer.serviceType === "people") reasons.push("offer_people_only")
    if (req.cargoWeightLbs != null && offer.cargoWeightLbs != null && req.cargoWeightLbs > offer.cargoWeightLbs) {
      reasons.push("too_heavy")
    }
    const dims = [req.cargoLengthIn, req.cargoWidthIn, req.cargoHeightIn]
    if (dims.every((d) => d != null && d > 0) && offer.cargoLengthIn && offer.cargoWidthIn) {
      const fits = boxFits(dims as [number, number, number], {
        l: offer.cargoLengthIn,
        w: offer.cargoWidthIn,
        h: offer.cargoHeightIn,
        openTop: offer.openTop,
      })
      if (!fits) reasons.push("too_big")
    }
  }

  if (COLD_RANK[offer.coldChain] < COLD_RANK[req.coldChainRequired]) reasons.push("no_cold_chain")

  return { ok: reasons.length === 0, reasons }
}

export const inchesLabel = (l?: number | null, w?: number | null, h?: number | null) =>
  [l, w, h].map((v) => (v == null ? "—" : Math.round(v))).join(" × ") + " in"

type Route = { originCity: string; originState: string; destCity: string; destState: string }
const norm = (s: string) => s.trim().toLowerCase()
const samePlace = (c1: string, s1: string, c2: string, s2: string) => norm(c1) === norm(c2) && s1 === s2

/** Capacity + same route (city/state) + overlapping time windows. */
export function matchTrip(
  offer: Capacity & Route & { startWindowFrom: Date; startWindowTo: Date },
  req: Need & Route & { windowFrom: Date; windowTo: Date },
): MatchResult {
  const result = matchOfferToRequest(offer, req)
  const reasons = [...result.reasons]
  if (!samePlace(offer.originCity, offer.originState, req.originCity, req.originState) ||
      !samePlace(offer.destCity, offer.destState, req.destCity, req.destState)) {
    reasons.unshift("different_route")
  }
  if (offer.startWindowFrom > req.windowTo || offer.startWindowTo < req.windowFrom) reasons.unshift("different_time")
  return { ok: reasons.length === 0, reasons }
}

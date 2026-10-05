// Server-side validation shared by the offer and request APIs.
// Errors are returned as short codes; the UI translates them (messages/*.json → "errors").

export class ValidationError extends Error {
  code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

const fail = (code: string): never => {
  throw new ValidationError(code)
}

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA",
  "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
  "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
]

/** Grace period so a form filled "right now" is not rejected as past. */
const PAST_GRACE_MS = 10 * 60 * 1000
const MAX_DAYS_AHEAD = 365
const MAX_WINDOW_DAYS = 14
const DAY = 24 * 60 * 60 * 1000

export function parseWindow(fromRaw: unknown, toRaw: unknown, opts: { allowPast?: boolean } = {}) {
  const from = new Date(String(fromRaw ?? ""))
  const to = new Date(String(toRaw ?? ""))
  if (isNaN(from.getTime()) || isNaN(to.getTime())) fail("date_invalid")
  const now = Date.now()
  if (!opts.allowPast && from.getTime() < now - PAST_GRACE_MS) fail("date_past")
  if (to.getTime() <= from.getTime()) fail("date_order")
  if (from.getTime() > now + MAX_DAYS_AHEAD * DAY) fail("date_too_far")
  if (to.getTime() - from.getTime() > MAX_WINDOW_DAYS * DAY) fail("window_too_long")
  return { from, to }
}

export function parsePlace(cityRaw: unknown, stateRaw: unknown, zipRaw: unknown) {
  const city = String(cityRaw ?? "").trim().replace(/\s+/g, " ")
  if (city.length < 2 || city.length > 80 || !/^[\p{L}\p{M} .'-]+$/u.test(city)) fail("city_invalid")
  const state = String(stateRaw ?? "NE").trim().toUpperCase()
  if (!US_STATES.includes(state)) fail("state_invalid")
  const zipStr = zipRaw == null ? "" : String(zipRaw).trim()
  if (zipStr && !/^\d{5}$/.test(zipStr)) fail("zip_invalid")
  return { city, state, zip: zipStr || null }
}

/** PRD §2: during the Nebraska launch, origin or destination must be in Nebraska. */
export function requireNebraska(originState: string, destState: string) {
  if (originState !== "NE" && destState !== "NE") fail("outside_nebraska")
}

export function parseNumber(raw: unknown, min: number, max: number, code: string, opts: { integer?: boolean; optional?: boolean } = {}) {
  if (opts.optional && (raw == null || raw === "")) return null
  const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""))
  if (!Number.isFinite(n) || n < min || n > max) fail(code)
  if (opts.integer && !Number.isInteger(n)) fail(code)
  return n
}

export function parseEnum<T extends string>(raw: unknown, allowed: readonly T[], fallback: T): T {
  if (raw == null || raw === "") return fallback
  return (allowed as readonly string[]).includes(String(raw)) ? (raw as T) : fail("invalid_option")
}

export const SERVICE_TYPES = ["people", "cargo", "mixed"] as const
export const EXCLUSIVITY = ["exclusive", "shared", "either"] as const
export const COLD_CHAIN = ["none", "cooler_ice", "active_refrigeration"] as const

export const MAX_PRICE = 100_000

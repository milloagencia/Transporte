const CATEGORIES = ["sedan", "suv", "suv_3row", "minivan", "pickup", "cargo_van", "passenger_van", "box_truck", "trailer", "other"] as const
const COLD = ["none", "cooler_ice", "active_refrigeration"] as const

type Cat = (typeof CATEGORIES)[number]
type Cold = (typeof COLD)[number]

const num = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN
  return Number.isFinite(n) && n >= min && n <= max ? n : null
}

/** Validates the body sent when a driver adds a vehicle. Returns data or an error message. */
export function parseVehicleInput(body: Record<string, unknown>) {
  const make = String(body.make ?? "").trim().slice(0, 60)
  const model = String(body.model ?? "").trim().slice(0, 60)
  if (!make || !model) return { error: "vehicle_make_required" as const }
  const category = (CATEGORIES as readonly string[]).includes(String(body.category)) ? (body.category as Cat) : "other"
  const seats = num(body.seats, 0, 60)
  const cargoLengthIn = num(body.cargoLengthIn, 1, 720)
  const cargoWidthIn = num(body.cargoWidthIn, 1, 120)
  const openTop = Boolean(body.openTop)
  const cargoHeightIn = openTop ? null : num(body.cargoHeightIn, 1, 160)
  const payloadLbs = num(body.payloadLbs, 1, 80000)
  if (seats == null || cargoLengthIn == null || cargoWidthIn == null || payloadLbs == null || (!openTop && cargoHeightIn == null)) {
    return { error: "vehicle_capacity_required" as const }
  }
  const year = num(body.year, 1950, new Date().getFullYear() + 1)
  const coldChain = (COLD as readonly string[]).includes(String(body.coldChain)) ? (body.coldChain as Cold) : "none"
  const plateNumber = String(body.plateNumber ?? "").toUpperCase().replace(/[^A-Z0-9 -]/g, "").trim().slice(0, 10)
  if (plateNumber.replace(/[ -]/g, "").length < 2) return { error: "plate_required" as const }
  const plateState = /^[A-Za-z]{2}$/.test(String(body.plateState ?? "")) ? String(body.plateState).toUpperCase() : "NE"
  const color = String(body.color ?? "").trim().slice(0, 30) || null
  const vehicleModelId = typeof body.vehicleModelId === "string" && body.vehicleModelId ? body.vehicleModelId : null
  return {
    data: {
      make, model, plateNumber, plateState, color, year: year == null ? null : Math.round(year), category,
      seats: Math.round(seats), cargoLengthIn, cargoWidthIn, cargoHeightIn, openTop, payloadLbs, coldChain, vehicleModelId,
    },
  }
}

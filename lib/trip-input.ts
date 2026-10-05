import type { Vehicle } from "@prisma/client"
import {
  COLD_CHAIN, EXCLUSIVITY, MAX_PRICE, SERVICE_TYPES,
  ValidationError, parseEnum, parseNumber, parsePlace, parseWindow, requireNebraska,
} from "@/lib/validation"

type Body = Record<string, unknown>

/** Validates a trip offer. Capacity comes from the vehicle; the driver may offer less. */
export function buildOfferData(body: Body, vehicle: Vehicle, opts: { allowPast?: boolean } = {}) {
  const origin = parsePlace(body.originCity, body.originState, body.originZip)
  // "Any destination": the driver goes wherever the customer needs, priced per mile
  const anyDestination = body.anyDestination === true || body.anyDestination === "true"
  const dest = anyDestination ? { city: "", state: origin.state, zip: null } : parsePlace(body.destCity, body.destState, body.destZip)
  requireNebraska(origin.state, dest.state)
  const maxTripMiles = anyDestination ? parseNumber(body.maxTripMiles, 5, 2000, "miles_invalid", { optional: true }) : null
  const rateUnit = anyDestination ? "mile" : "trip"
  const { from, to } = parseWindow(body.startWindowFrom, body.startWindowTo, opts)
  const serviceType = parseEnum(body.serviceType, SERVICE_TYPES, "people")
  const exclusivity = parseEnum(body.exclusivity, EXCLUSIVITY, "either")
  const proposedRate = rateUnit === "mile"
    ? parseNumber(body.proposedRate, 0.1, 50, "rate_per_mile_invalid")!
    : parseNumber(body.proposedRate, 1, MAX_PRICE, "rate_invalid")!
  const carriesPeople = serviceType !== "cargo"
  const carriesCargo = serviceType !== "people"
  if (carriesPeople && vehicle.seats < 1) throw new ValidationError("vehicle_no_seats")

  const seats = carriesPeople
    ? parseNumber(body.seats ?? vehicle.seats, 1, vehicle.seats, "seats_invalid", { integer: true })
    : null
  const cargoWeightLbs = carriesCargo
    ? parseNumber(body.cargoWeightLbs ?? vehicle.payloadLbs, 1, vehicle.payloadLbs, "weight_over_payload")
    : null

  return {
    vehicleId: vehicle.id,
    originCity: origin.city, originState: origin.state, originZip: origin.zip,
    destCity: dest.city, destState: dest.state, destZip: dest.zip,
    anyDestination, maxTripMiles, rateUnit,
    startWindowFrom: from, startWindowTo: to,
    serviceType, exclusivity, proposedRate, seats, cargoWeightLbs,
    cargoLengthIn: carriesCargo ? vehicle.cargoLengthIn : null,
    cargoWidthIn: carriesCargo ? vehicle.cargoWidthIn : null,
    cargoHeightIn: carriesCargo ? vehicle.cargoHeightIn : null,
    openTop: carriesCargo ? vehicle.openTop : false,
    coldChain: vehicle.coldChain,
  }
}

/** Validates a trip request (people or cargo). */
export function buildRequestData(body: Body, opts: { allowPast?: boolean } = {}) {
  const origin = parsePlace(body.originCity, body.originState, body.originZip)
  const dest = parsePlace(body.destCity, body.destState, body.destZip)
  requireNebraska(origin.state, dest.state)
  const { from, to } = parseWindow(body.windowFrom, body.windowTo, opts)
  const serviceType = parseEnum(body.serviceType, ["people", "cargo"] as const, "people")
  const exclusivity = parseEnum(body.exclusivity, EXCLUSIVITY, "either")
  const budgetProposed = parseNumber(body.budgetProposed, 1, MAX_PRICE, "budget_invalid", { optional: true })

  const base = {
    originCity: origin.city, originState: origin.state, originZip: origin.zip,
    destCity: dest.city, destState: dest.state, destZip: dest.zip,
    windowFrom: from, windowTo: to, serviceType, exclusivity, budgetProposed,
  }

  if (serviceType === "people") {
    return {
      ...base,
      passengerCount: parseNumber(body.passengerCount, 1, 60, "passengers_invalid", { integer: true }),
      cargoWeightLbs: null, cargoLengthIn: null, cargoWidthIn: null, cargoHeightIn: null,
      cargoPieces: null, cargoDesc: null, coldChainRequired: "none" as const,
    }
  }
  const desc = typeof body.cargoDesc === "string" ? body.cargoDesc.trim().slice(0, 500) : ""
  return {
    ...base,
    passengerCount: null,
    cargoWeightLbs: parseNumber(body.cargoWeightLbs, 1, 80_000, "weight_invalid"),
    cargoLengthIn: parseNumber(body.cargoLengthIn, 1, 720, "dims_invalid"),
    cargoWidthIn: parseNumber(body.cargoWidthIn, 1, 120, "dims_invalid"),
    cargoHeightIn: parseNumber(body.cargoHeightIn, 1, 160, "dims_invalid"),
    cargoPieces: parseNumber(body.cargoPieces ?? 1, 1, 1000, "pieces_invalid", { integer: true }),
    cargoDesc: desc || null,
    coldChainRequired: parseEnum(body.coldChainRequired, COLD_CHAIN, "none"),
  }
}

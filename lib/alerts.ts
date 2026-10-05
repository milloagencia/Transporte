import type { TripAlert, TripOffer, TripRequest, Vehicle } from "@prisma/client"
import { db } from "@/lib/db"
import { coordsOf, roadMiles } from "@/lib/geo"
import { matchOfferToRequest } from "@/lib/matching"
import { sendMail } from "@/lib/mail"
import { SITE_URL } from "@/lib/seo-content"

// Saved-search alerts:
// - kind "offers":   a requester wants an email when a matching OFFER is posted
// - kind "requests": a driver wants an email when a matching REQUEST is posted
// To avoid spam: at most one email per alert every THROTTLE_HOURS, and alerts switch off
// when their dates pass (or the linked request is closed).
const THROTTLE_HOURS = 3
const HOUR = 3600 * 1000

const norm = (s?: string | null) => (s ?? "").trim().toLowerCase()

/** Is (city, state) within `radius` miles of the alert's place? Unknown cities fall back to the same name. */
function near(alertCity: string | null, alertState: string | null, city: string, state: string, radius: number) {
  if (!alertCity) return !alertState || alertState === state
  if (norm(alertCity) === norm(city) && (!alertState || alertState === state)) return true
  if (radius <= 0) return false
  const miles = roadMiles(coordsOf(alertCity, alertState ?? "NE"), coordsOf(city, state))
  return miles != null && miles <= radius
}

const overlaps = (aFrom: Date | null, aTo: Date | null, from: Date, to: Date) =>
  (!aTo || from <= aTo) && (!aFrom || to >= aFrom)

/** Does a new offer satisfy a requester's alert? */
export function offerMatchesAlert(a: TripAlert, o: TripOffer) {
  if (!near(a.originCity, a.originState, o.originCity, o.originState, a.radiusMiles)) return false
  if (!o.anyDestination && !near(a.destCity, a.destState, o.destCity, o.destState, a.radiusMiles)) return false
  if (!overlaps(a.dateFrom, a.dateTo, o.startWindowFrom, o.startWindowTo)) return false
  if (a.serviceType === "people" && o.serviceType === "cargo") return false
  if (a.serviceType === "cargo" && o.serviceType === "people") return false
  const wantsCargo = a.serviceType === "cargo" || a.cargoWeightLbs != null || a.cargoLengthIn != null
  const wantsPeople = a.serviceType === "people" || a.passengers != null
  // No specific need given: any offer on the route works (only refrigeration is checked)
  const needType = wantsCargo ? "cargo" : wantsPeople ? "people" : o.serviceType === "people" ? "people" : "cargo"
  return matchOfferToRequest(o, {
    serviceType: needType,
    passengerCount: a.passengers,
    cargoWeightLbs: a.cargoWeightLbs, cargoLengthIn: a.cargoLengthIn, cargoWidthIn: a.cargoWidthIn, cargoHeightIn: a.cargoHeightIn,
    coldChainRequired: a.coldChain,
  }).ok
}

/** Does a new request satisfy a driver's alert (optionally: fits the driver's vehicle)? */
export function requestMatchesAlert(a: TripAlert, r: TripRequest, vehicle: Vehicle | null) {
  if (!near(a.originCity, a.originState, r.originCity, r.originState, a.radiusMiles)) return false
  if (!near(a.destCity, a.destState, r.destCity, r.destState, a.radiusMiles)) return false
  if (!overlaps(a.dateFrom, a.dateTo, r.windowFrom, r.windowTo)) return false
  if (a.serviceType && a.serviceType !== "mixed" && a.serviceType !== r.serviceType) return false
  if (vehicle) {
    const fit = matchOfferToRequest(
      { serviceType: "mixed", seats: vehicle.seats, cargoWeightLbs: vehicle.payloadLbs, cargoLengthIn: vehicle.cargoLengthIn,
        cargoWidthIn: vehicle.cargoWidthIn, cargoHeightIn: vehicle.cargoHeightIn, openTop: vehicle.openTop, coldChain: vehicle.coldChain },
      r,
    )
    if (!fit.ok) return false
  }
  return true
}

function email(lang: string, kind: "offers" | "requests", trip: { originCity: string; originState: string; destCity: string; destState: string; when: Date }, link: string, unsubscribe: string) {
  const es = lang === "es"
  const dest = trip.destCity ? `${trip.destCity}, ${trip.destState}` : (es ? "cualquier destino" : "any destination")
  const route = `${trip.originCity}, ${trip.originState} → ${dest}`
  const when = trip.when.toLocaleString(es ? "es-US" : "en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" })
  const subject = kind === "offers"
    ? (es ? `Nuevo viaje disponible: ${route}` : `New trip available: ${route}`)
    : (es ? `Nueva solicitud que te puede interesar: ${route}` : `New request you may like: ${route}`)
  const intro = kind === "offers"
    ? (es ? "Un conductor publicó un viaje que coincide con lo que estás buscando:" : "A driver posted a trip that matches what you're looking for:")
    : (es ? "Alguien publicó una solicitud que coincide con tu alerta:" : "Someone posted a request that matches your alert:")
  const cta = es ? "Ver el viaje" : "View the trip"
  const unsub = es ? "Dejar de recibir esta alerta" : "Stop this alert"
  const text = `${intro}\n\n${route}\n${when}\n\n${cta}: ${link}\n\n${unsub}: ${unsubscribe}`
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px">
    <p style="font-size:18px;font-weight:bold;color:#2563eb">Collage Transport</p>
    <p>${intro}</p>
    <p style="font-size:16px"><strong>${route}</strong><br>${when}</p>
    <p><a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${cta}</a></p>
    <p style="font-size:12px;color:#64748b;margin-top:24px"><a href="${unsubscribe}" style="color:#64748b">${unsub}</a></p>
  </div>`
  return { subject, text, html }
}

async function deliver(alerts: (TripAlert & { user: { email: string; language: string; status: string } })[], kind: "offers" | "requests",
  trip: { id: string; originCity: string; originState: string; destCity: string; destState: string; when: Date }) {
  const now = Date.now()
  for (const a of alerts) {
    if (a.user.status !== "active" || a.user.email.endsWith(".invalid")) continue
    if (a.lastNotifiedAt && a.lastNotifiedAt.getTime() > now - THROTTLE_HOURS * HOUR) continue
    const link = `${SITE_URL}/${kind === "offers" ? "offers" : "requests"}/${trip.id}`
    const unsubscribe = `${SITE_URL}/api/alerts/unsubscribe?token=${a.unsubscribeToken}`
    const m = email(a.user.language, kind, trip, link, unsubscribe)
    try {
      await sendMail(a.user.email, m.subject, m.text, m.html)
      await db.tripAlert.update({ where: { id: a.id }, data: { lastNotifiedAt: new Date(), matchesSent: { increment: 1 } } })
    } catch (e) {
      console.error("[alerts] email failed", e)
    }
  }
}

/** Expire alerts whose dates passed or whose request is closed. */
async function expireOld() {
  await db.tripAlert.updateMany({ where: { active: true, dateTo: { lt: new Date() } }, data: { active: false } })
  const linked = await db.tripAlert.findMany({ where: { active: true, requestId: { not: null } }, select: { id: true, requestId: true } })
  if (linked.length === 0) return
  const open = new Set(
    (await db.tripRequest.findMany({ where: { id: { in: linked.map((l) => l.requestId!) }, status: "open" }, select: { id: true } })).map((r) => r.id),
  )
  const closed = linked.filter((l) => !open.has(l.requestId!)).map((l) => l.id)
  if (closed.length) await db.tripAlert.updateMany({ where: { id: { in: closed } }, data: { active: false } })
}

/** Called after a new offer is created. */
export async function notifyOfferAlerts(offer: TripOffer) {
  await expireOld()
  const alerts = await db.tripAlert.findMany({
    where: { kind: "offers", active: true, userId: { not: offer.driverId } },
    include: { user: { select: { email: true, language: true, status: true } } },
  })
  const matching = alerts.filter((a) => offerMatchesAlert(a, offer))
  await deliver(matching, "offers", { id: offer.id, originCity: offer.originCity, originState: offer.originState, destCity: offer.destCity, destState: offer.destState, when: offer.startWindowFrom })
}

/** Called after a new request is created. */
export async function notifyRequestAlerts(request: TripRequest) {
  await expireOld()
  const alerts = await db.tripAlert.findMany({
    where: { kind: "requests", active: true, userId: { not: request.requesterId } },
    include: { user: { select: { email: true, language: true, status: true } } },
  })
  const vehicleIds = [...new Set(alerts.map((a) => a.vehicleId).filter(Boolean) as string[])]
  const vehicles = new Map((await db.vehicle.findMany({ where: { id: { in: vehicleIds } } })).map((v) => [v.id, v]))
  const matching = alerts.filter((a) => requestMatchesAlert(a, request, a.vehicleId ? vehicles.get(a.vehicleId) ?? null : null))
  await deliver(matching, "requests", { id: request.id, originCity: request.originCity, originState: request.originState, destCity: request.destCity, destState: request.destState, when: request.windowFrom })
}

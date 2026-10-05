// Demo data so the platform can be seen "in operation".
// All demo users use the domain below; clearDemo() removes them and everything they own.
// Dates are relative to "now", so re-seeding always produces upcoming trips.

export const DEMO_DOMAIN = "demo.collagetaxi.com"

const HOUR = 3600 * 1000
const DAY = 24 * HOUR

/** Next day (from today) at a given hour, America/Chicago is UTC-5/-6: we use UTC-5 hours. */
function at(daysFromNow, hourCentral) {
  const d = new Date(Date.now() + daysFromNow * DAY)
  d.setUTCHours(hourCentral + 5, 0, 0, 0)
  return d
}

const DRIVERS = [
  { key: "carlos", name: "Carlos M. · Demo", vehicle: { make: "Ford", model: "F-150 (5.5 ft bed)", year: 2021, category: "pickup", seats: 4, cargoLengthIn: 67, cargoWidthIn: 50, cargoHeightIn: null, openTop: true, payloadLbs: 1700, coldChain: "cooler_ice" } },
  { key: "yanelis", name: "Yanelis R. · Demo", vehicle: { make: "Honda", model: "Odyssey", year: 2020, category: "minivan", seats: 7, cargoLengthIn: 100, cargoWidthIn: 48, cargoHeightIn: 45, openTop: false, payloadLbs: 1300, coldChain: "none" } },
  { key: "express", name: "Omaha Express Cargo · Demo", vehicle: { make: "Ford", model: "Transit (148 WB medium roof)", year: 2022, category: "cargo_van", seats: 1, cargoLengthIn: 143, cargoWidthIn: 51, cargoHeightIn: 72, openTop: false, payloadLbs: 3200, coldChain: "active_refrigeration" } },
  { key: "luis", name: "Luis P. · Demo", vehicle: { make: "Toyota", model: "Camry", year: 2019, category: "sedan", seats: 4, cargoLengthIn: 40, cargoWidthIn: 38, cargoHeightIn: 18, openTop: false, payloadLbs: 850, coldChain: "none" } },
  { key: "mike", name: "Mike T. · Demo", vehicle: { make: "Box truck", model: "16 ft", year: 2018, category: "box_truck", seats: 2, cargoLengthIn: 192, cargoWidthIn: 92, cargoHeightIn: 90, openTop: false, payloadLbs: 5000, coldChain: "none" } },
]

const REQUESTERS = [
  { key: "maria", name: "María G. · Demo" },
  { key: "jorge", name: "Jorge A. · Demo" },
  { key: "ana", name: "Ana L. · Demo" },
  { key: "pedro", name: "Pedro S. · Demo" },
  { key: "sarah", name: "Sarah K. · Demo" },
]

// [key, driver, service, origin, dest, dayOffset, startHour, windowHours, rate, seats?, weight?, exclusivity]
const OFFERS = [
  ["o1", "luis", "people", ["Omaha", "68102"], ["Lincoln", "68508"], 2, 7, 3, 25, 3, null, "shared"],
  ["o2", "yanelis", "mixed", ["Omaha", "68107"], ["Grand Island", "68801"], 3, 9, 4, 45, 5, 800, "shared"],
  ["o3", "carlos", "cargo", ["Lincoln", "68510"], ["Omaha", "68131"], 2, 13, 5, 80, null, 1500, "either"],
  ["o4", "express", "cargo", ["Omaha", "68117"], ["Des Moines", "50309", "IA"], 4, 6, 6, 220, null, 3000, "shared"],
  ["o5", "express", "cargo", ["Grand Island", "68803"], ["Kearney", "68847"], 5, 8, 4, 120, null, 2500, "either"],
  ["o6", "mike", "cargo", ["Omaha", "68137"], ["Kansas City", "64105", "MO"], 6, 7, 8, 450, null, 4800, "exclusive"],
  ["o7", "luis", "people", ["Lincoln", "68508"], ["Omaha", "68102"], 2, 17, 3, 25, 3, null, "shared"],
  ["o8", "yanelis", "people", ["Norfolk", "68701"], ["Omaha", "68102"], 7, 8, 4, 35, 6, null, "shared"],
  ["o9", "carlos", "mixed", ["Kearney", "68847"], ["North Platte", "69101"], 8, 10, 6, 90, 3, 1500, "either"],
  // Past trip, used by the completed deal
  ["o10", "yanelis", "people", ["Lincoln", "68508"], ["Omaha", "68102"], -5, 9, 3, 30, 5, null, "shared"],
]

// [key, requester, service, origin, dest, dayOffset, startHour, windowHours, budget, passengers?, cargo?]
const REQUESTS = [
  ["r1", "maria", "people", ["Omaha", "68105"], ["Lincoln", "68508"], 2, 6, 5, 30, 2, null],
  ["r2", "jorge", "cargo", ["Lincoln", "68506"], ["Omaha", "68104"], 2, 12, 8, 90, null, { weight: 180, l: 84, w: 36, h: 34, pieces: 1, desc: "Sofá de 3 plazas", cold: "none" }],
  ["r3", "ana", "cargo", ["Omaha", "68110"], ["Des Moines", "50309", "IA"], 4, 5, 10, 200, null, { weight: 900, l: 48, w: 40, h: 40, pieces: 6, desc: "6 cajas de mudanza y una lavadora", cold: "none" }],
  ["r4", "pedro", "cargo", ["Grand Island", "68801"], ["Kearney", "68845"], 5, 7, 6, 100, null, { weight: 400, l: 40, w: 30, h: 30, pieces: 8, desc: "Comida congelada para un evento", cold: "active_refrigeration" }],
  ["r5", "sarah", "people", ["Norfolk", "68701"], ["Omaha", "68102"], 7, 7, 5, 40, 4, null],
  ["r6", "maria", "cargo", ["Omaha", "68107"], ["Kansas City", "64105", "MO"], 6, 6, 10, 400, null, { weight: 3500, l: 160, w: 80, h: 80, pieces: 30, desc: "Mudanza de apartamento de 2 cuartos", cold: "none" }],
  ["r7", "jorge", "people", ["Omaha", "68102"], ["Grand Island", "68801"], 3, 8, 4, 50, 2, null],
  ["r8", "ana", "cargo", ["Columbus", "68601"], ["Lincoln", "68508"], 9, 9, 6, 70, null, { weight: 60, l: 30, w: 20, h: 20, pieces: 3, desc: "Paquetes pequeños", cold: "none" }],
]

const email = (key) => `${key}@${DEMO_DOMAIN}`

export async function clearDemo(db) {
  const users = await db.user.findMany({ where: { email: { endsWith: `@${DEMO_DOMAIN}` } }, select: { id: true } })
  const ids = users.map((u) => u.id)
  if (ids.length === 0) return 0
  await db.deal.deleteMany({ where: { OR: [{ driverId: { in: ids } }, { requesterId: { in: ids } }] } })
  await db.user.deleteMany({ where: { id: { in: ids } } })
  return ids.length
}

export async function seedDemo(db) {
  await clearDemo(db)
  const users = {}
  const vehicles = {}

  for (const d of DRIVERS) {
    const u = await db.user.create({
      data: { email: email(d.key), name: d.name, role: "driver", language: "es", emailVerified: new Date(), wantsToDrive: true, onboardedAt: new Date(), accountType: d.key === "express" ? "company" : "individual", contactName: d.key === "express" ? "Raúl V. · Demo" : null },
    })
    users[d.key] = u
    await db.driverProfile.create({
      data: { userId: u.id, verificationStatus: "approved", licenseNote: "Demo", insuranceNote: "Demo", inspectionNote: "Demo" },
    })
    vehicles[d.key] = await db.vehicle.create({ data: { ...d.vehicle, ownerId: u.id } })
  }
  for (const r of REQUESTERS) {
    users[r.key] = await db.user.create({
      data: { email: email(r.key), name: r.name, role: "user", language: "es", emailVerified: new Date(), wantsToShip: true, onboardedAt: new Date() },
    })
  }

  const offers = {}
  for (const [key, drv, service, o, d, day, hour, win, rate, seats, weight, exclusivity] of OFFERS) {
    const v = vehicles[drv]
    const cargo = service !== "people"
    offers[key] = await db.tripOffer.create({
      data: {
        driverId: users[drv].id, vehicleId: v.id,
        originCity: o[0], originZip: o[1], originState: o[2] ?? "NE",
        destCity: d[0], destZip: d[1], destState: d[2] ?? "NE",
        startWindowFrom: at(day, hour), startWindowTo: new Date(at(day, hour).getTime() + win * HOUR),
        serviceType: service, exclusivity,
        seats: service === "cargo" ? null : seats,
        cargoWeightLbs: cargo ? weight : null,
        cargoLengthIn: cargo ? v.cargoLengthIn : null, cargoWidthIn: cargo ? v.cargoWidthIn : null,
        cargoHeightIn: cargo ? v.cargoHeightIn : null, openTop: cargo ? v.openTop : false,
        coldChain: v.coldChain, proposedRate: rate,
        status: day < 0 ? "completed" : "active",
      },
    })
  }

  const requests = {}
  for (const [key, who, service, o, d, day, hour, win, budget, pax, c] of REQUESTS) {
    requests[key] = await db.tripRequest.create({
      data: {
        requesterId: users[who].id,
        originCity: o[0], originZip: o[1], originState: o[2] ?? "NE",
        destCity: d[0], destZip: d[1], destState: d[2] ?? "NE",
        windowFrom: at(day, hour), windowTo: new Date(at(day, hour).getTime() + win * HOUR),
        serviceType: service, exclusivity: "either", budgetProposed: budget,
        passengerCount: service === "people" ? pax : null,
        cargoWeightLbs: c?.weight ?? null, cargoLengthIn: c?.l ?? null, cargoWidthIn: c?.w ?? null,
        cargoHeightIn: c?.h ?? null, cargoPieces: c?.pieces ?? null, cargoDesc: c?.desc ?? null,
        coldChainRequired: c?.cold ?? "none",
      },
    })
  }

  // Deals in different states, to see every step of the flow
  const deal = (offerKey, requesterKey, extra = {}) =>
    db.deal.create({
      data: { tripOfferId: offers[offerKey].id, driverId: offers[offerKey].driverId, requesterId: users[requesterKey].id, ...extra },
    })
  const propose = (dealId, byKey, price, message, status = "countered") =>
    db.proposal.create({ data: { dealId, proposedById: users[byKey].id, price, message, status } })

  // 1) Negotiating: María asks for less, Luis counters
  const d1 = await deal("o1", "maria")
  await propose(d1.id, "maria", 40, "Somos 2 personas, ¿lo dejas en $40 las dos?")
  await propose(d1.id, "luis", 45, "Puedo en $45 y las recojo en la puerta.", "pending")

  // 2) Accepted, waiting for payment
  const d2 = await deal("o3", "jorge", { status: "accepted_pending_payment", finalPrice: 85 })
  await propose(d2.id, "jorge", 75, "Es un sofá, ya está envuelto.")
  await propose(d2.id, "carlos", 85, "$85 con ayuda para bajarlo.", "accepted")

  // 3) Paid (simulated escrow), trip pending
  const d3 = await deal("o4", "ana", { status: "paid_escrow", finalPrice: 210 })
  await propose(d3.id, "ana", 210, "6 cajas y una lavadora.", "accepted")
  await db.payment.create({ data: { dealId: d3.id, amount: 210, platformFee: 21, status: "simulated_escrow" } })
  await db.completionConfirmation.create({ data: { dealId: d3.id, confirmedByDriverAt: null, autoReleaseAt: new Date(Date.now() + 5 * DAY) } })

  // 4) Completed and released
  const d4 = await deal("o10", "sarah", { status: "completed", finalPrice: 120 })
  await propose(d4.id, "sarah", 120, "4 personas de Lincoln a Omaha.", "accepted")
  await db.payment.create({ data: { dealId: d4.id, amount: 120, platformFee: 12, status: "simulated_released" } })
  await db.completionConfirmation.create({ data: { dealId: d4.id, confirmedByDriverAt: new Date(), confirmedByRequesterAt: new Date() } })
  // Both rated each other: one comment already approved, the other waiting for the admin
  await db.review.create({ data: { dealId: d4.id, authorId: users.sarah.id, subjectId: users.yanelis.id, authorRole: "requester", stars: 5, comment: "Muy puntual y la minivan muy limpia. La recomiendo.", commentStatus: "approved" } })
  await db.review.create({ data: { dealId: d4.id, authorId: users.yanelis.id, subjectId: users.sarah.id, authorRole: "driver", stars: 4, comment: "Todo bien, solo llegaron 10 minutos tarde al punto de encuentro.", commentStatus: "pending" } })

  // Two more completed trips in the past, with ratings for the drivers
  const past = async (offerKey, requesterKey, price, starsForDriver, comment, status) => {
    const d = await deal(offerKey, requesterKey, { status: "completed", finalPrice: price })
    await db.payment.create({ data: { dealId: d.id, amount: price, platformFee: price * 0.1, status: "simulated_released" } })
    await db.review.create({ data: { dealId: d.id, authorId: users[requesterKey].id, subjectId: offers[offerKey].driverId, authorRole: "requester", stars: starsForDriver, comment, commentStatus: status } })
  }
  await past("o10", "jorge", 30, 5, "Excelente servicio, muy amable.", "approved")
  await past("o10", "pedro", 30, 2, "Me cobró de más en efectivo, llámame al 402-555-0199", "pending")

  // 5) Cancelled by the requester (5% penalty, more than 24 h before)
  const d5 = await deal("o6", "maria", { status: "cancelled", finalPrice: 430 })
  await propose(d5.id, "maria", 430, "Mudanza completa.", "accepted")
  await db.cancellation.create({ data: { dealId: d5.id, cancelledById: users.maria.id, reason: "Cambio de fecha", penaltyRate: 0.05, penaltyAmount: 21.5 } })

  return { users: DRIVERS.length + REQUESTERS.length, offers: OFFERS.length, requests: REQUESTS.length, deals: 7, reviews: 4 }
}

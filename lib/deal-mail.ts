import { db } from "@/lib/db"
import { sendMail } from "@/lib/mail"
import { SITE_URL } from "@/lib/seo-content"

// Emails the other side of a deal when something happens that needs their attention,
// so a counteroffer or an acceptance does not go unnoticed until they open the app.
export type DealEvent = "proposal" | "accepted" | "paid" | "cancelled" | "confirmed" | "completed"

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)

function build(lang: string, event: DealEvent, who: string, price: number | null, route: string, link: string) {
  const es = lang === "es"
  const money = price != null ? `$${price}` : ""
  const subject = {
    proposal: es ? `${who} te envió una propuesta de ${money}` : `${who} sent you a ${money} proposal`,
    accepted: es ? `${who} aceptó el precio de ${money}` : `${who} accepted the ${money} price`,
    paid: es ? `El viaje con ${who} está pagado` : `Your trip with ${who} is paid`,
    cancelled: es ? `${who} canceló el acuerdo` : `${who} cancelled the deal`,
    confirmed: es ? `${who} confirmó que el viaje se hizo` : `${who} confirmed the trip happened`,
    completed: es ? `Viaje completado con ${who}` : `Trip with ${who} completed`,
  }[event]
  const body = {
    proposal: es ? "Puedes aceptarla o responder con otra propuesta." : "You can accept it or reply with another proposal.",
    accepted: es ? "Si eres el cliente, ya puedes hacer el pago para confirmar el viaje." : "If you are the customer, you can now pay to confirm the trip.",
    paid: es ? "El pago está retenido hasta que los dos confirmen que el viaje se hizo. Ya pueden ver sus datos de contacto." : "The payment is held until you both confirm the trip happened. You can now see each other's contact details.",
    cancelled: es ? "El acuerdo ya no está activo." : "The deal is no longer active.",
    confirmed: es ? "Confírmalo tú también para cerrar el acuerdo y liberar el pago." : "Confirm it too to close the deal and release the payment.",
    completed: es ? "Gracias por viajar con Collage Transport. Ya puedes calificar a la otra persona." : "Thanks for using Collage Transport. You can now rate the other person.",
  }[event]
  const cta = es ? "Ver el acuerdo" : "View the deal"
  const text = `${subject}\n${route}\n\n${body}\n\n${cta}: ${link}`
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px">
    <p style="font-size:18px;font-weight:bold;color:#2563eb">Collage Transport</p>
    <p style="font-size:16px"><strong>${esc(subject)}</strong><br>${esc(route)}</p>
    <p>${esc(body)}</p>
    <p><a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${cta}</a></p>
  </div>`
  return { subject, text, html }
}

/** Sends the email to the participant who did NOT trigger the event. Never throws. */
export async function notifyDealEvent(dealId: string, actorId: string, event: DealEvent, price?: number | null) {
  try {
    const deal = await db.deal.findUnique({
      where: { id: dealId },
      include: {
        driver: { select: { id: true, name: true, email: true, language: true, status: true } },
        requester: { select: { id: true, name: true, email: true, language: true, status: true } },
        tripOffer: { select: { originCity: true, originState: true, destCity: true, destState: true } },
        tripRequest: { select: { originCity: true, originState: true, destCity: true, destState: true } },
      },
    })
    if (!deal) return
    const actor = deal.driver.id === actorId ? deal.driver : deal.requester
    const to = deal.driver.id === actorId ? deal.requester : deal.driver
    if (to.status !== "active" || to.email.endsWith(".invalid")) return
    const trip = deal.tripOffer ?? deal.tripRequest
    const route = trip ? `${trip.originCity}, ${trip.originState} → ${trip.destCity ? `${trip.destCity}, ${trip.destState}` : "…"}` : ""
    const m = build(to.language, event, actor.name ?? (to.language === "es" ? "La otra persona" : "The other person"), price ?? deal.finalPrice ?? null, route, `${SITE_URL}/deals/${deal.id}`)
    await sendMail(to.email, m.subject, m.text, m.html)
  } catch (e) {
    console.error("[deal-mail]", e)
  }
}

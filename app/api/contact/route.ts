import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { sendMail } from "@/lib/mail"
import { rateLimited } from "@/lib/rate-limit"

const TOPICS = ["general", "driver", "business", "support", "privacy", "other"]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!)

/** Public contact form: saves the message (visible in Admin → Mensajes) and emails the admins. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}))
  if (b.website) return NextResponse.json({ ok: true }) // honeypot: bots fill hidden fields
  const h = await headers()
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown").split(",")[0].trim()
  if (rateLimited(`contact:${ip}`, 5, 60 * 60 * 1000)) return NextResponse.json({ error: "rate_limited" }, { status: 429 })

  const name = String(b.name ?? "").trim().slice(0, 100)
  const email = String(b.email ?? "").trim().toLowerCase().slice(0, 254)
  const message = String(b.message ?? "").trim().slice(0, 3000)
  const topic = TOPICS.includes(b.topic) ? b.topic : "general"
  const lang = b.lang === "en" ? "en" : "es"
  if (name.length < 2 || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json({ error: "contact_invalid" }, { status: 400 })
  }
  const saved = await db.contactMessage.create({ data: { name, email, topic, message, lang } })

  const to = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL
  if (to) {
    const subject = `[Contacto · ${topic}] ${name}`
    const text = `${name} <${email}>\nTema: ${topic}\n\n${message}\n\nAdmin → Mensajes`
    const html = `<p><strong>${esc(name)}</strong> &lt;${esc(email)}&gt;<br>Tema: ${esc(topic)}</p><p style="white-space:pre-wrap">${esc(message)}</p>`
    await sendMail(to.split(",")[0].trim(), subject, text, html).catch((e) => console.error("[contact] email failed", e))
  }
  return NextResponse.json({ ok: true, id: saved.id }, { status: 201 })
}

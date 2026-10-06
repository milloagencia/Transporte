"use client"
import { useState } from "react"
import type { Lang } from "@/lib/seo-content"

const T = {
  es: { name: "Tu nombre", email: "Tu correo", topic: "Tema", message: "Mensaje", send: "Enviar mensaje", sending: "Enviando...", ok: "¡Gracias! Recibimos tu mensaje y te responderemos por correo.", error: "Revisa los datos: nombre, un correo válido y un mensaje de al menos 10 letras.", rate: "Enviaste demasiados mensajes. Intenta más tarde.",
    topics: { general: "Pregunta general", driver: "Quiero ser conductor", business: "Soy una empresa", support: "Ayuda con un viaje", privacy: "Privacidad / mis datos", other: "Otro" } },
  en: { name: "Your name", email: "Your email", topic: "Topic", message: "Message", send: "Send message", sending: "Sending...", ok: "Thanks! We got your message and will reply by email.", error: "Check your details: name, a valid email and a message of at least 10 characters.", rate: "Too many messages. Please try later.",
    topics: { general: "General question", driver: "I want to drive", business: "I'm a business", support: "Help with a trip", privacy: "Privacy / my data", other: "Other" } },
}

const field = "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

export default function ContactForm({ lang }: { lang: Lang }) {
  const t = T[lang]
  const [f, setF] = useState({ name: "", email: "", topic: "general", message: "", website: "" })
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error" | "rate">("idle")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState("sending")
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, lang }) })
    setState(res.ok ? "ok" : res.status === 429 ? "rate" : "error")
  }

  if (state === "ok") return <p role="status" className="rounded-md bg-emerald-50 p-4 text-emerald-800">{t.ok}</p>
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">{t.name}<input className={field} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required minLength={2} maxLength={100} autoComplete="name" /></label>
        <label className="text-sm font-medium">{t.email}<input type="email" className={field} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required autoComplete="email" /></label>
      </div>
      <label className="block text-sm font-medium">{t.topic}
        <select className={field} value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>
          {Object.entries(t.topics).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium">{t.message}<textarea className={field + " min-h-32"} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required minLength={10} maxLength={3000} /></label>
      {/* Hidden field for bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
      {(state === "error" || state === "rate") && <p role="alert" className="text-sm text-red-600">{state === "rate" ? t.rate : t.error}</p>}
      <button type="submit" disabled={state === "sending"} className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">{state === "sending" ? t.sending : t.send}</button>
    </form>
  )
}

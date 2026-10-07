import { NextResponse } from "next/server"
import { signIn } from "@/auth"
import { db } from "@/lib/db"
import { requestIp } from "@/lib/mobile-auth"
import { rateLimited } from "@/lib/rate-limit"

export const runtime = "nodejs"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const WINDOW = 15 * 60 * 1000

export async function POST(request: Request) {
  const ip = requestIp(request)
  if (rateLimited(`mobile-login-ip:${ip}`, 10, WINDOW)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const requestId = typeof body?.requestId === "string" ? body.requestId : ""
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : ""
  if (!requestId || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 })
  }
  if (rateLimited(`mobile-login-email:${email}`, 3, WINDOW) || rateLimited(`mobile-login-request:${requestId}`, 3, WINDOW)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  const now = new Date()
  const authRequest = await db.mobileAuthRequest.findUnique({ where: { id: requestId } })
  if (!authRequest || authRequest.expiresAt <= now || authRequest.codeUsedAt || authRequest.loginAttempts >= 3 ||
      (authRequest.email && authRequest.email !== email)) {
    return NextResponse.json({ ok: true, message: "Si la solicitud es válida, enviaremos un enlace de acceso." })
  }
  const claimed = await db.mobileAuthRequest.updateMany({
    where: { id: requestId, expiresAt: { gt: now }, codeUsedAt: null, loginAttempts: { lt: 3 }, OR: [{ email: null }, { email }] },
    data: { email, loginAttempts: { increment: 1 } },
  })
  if (claimed.count !== 1) {
    return NextResponse.json({ ok: true, message: "Si la solicitud es válida, enviaremos un enlace de acceso." })
  }

  try {
    await signIn("email", {
      email,
      redirectTo: `/mobile/confirm?requestId=${encodeURIComponent(requestId)}`,
      redirect: false,
    })
  } catch (error) {
    console.error("[mobile-auth] magic-link request failed", error)
  }
  return NextResponse.json(
    { ok: true, message: "Si la solicitud es válida, enviaremos un enlace de acceso." },
    { headers: { "Cache-Control": "no-store" } },
  )
}

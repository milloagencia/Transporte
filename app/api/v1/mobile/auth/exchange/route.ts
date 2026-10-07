import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import {
  hashSecret,
  MOBILE_CODE_MINUTES,
  MOBILE_SESSION_DAYS,
  randomSecret,
  requestIp,
  verifierChallenge,
} from "@/lib/mobile-auth"
import { rateLimited } from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const ip = requestIp(request)
  if (rateLimited(`mobile-exchange-ip:${ip}`, 15, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }
  const body = await request.json().catch(() => null)
  const requestId = typeof body?.requestId === "string" ? body.requestId : ""
  const code = typeof body?.code === "string" ? body.code : ""
  const verifier = typeof body?.verifier === "string" ? body.verifier : ""
  if (!requestId || !/^[A-Za-z0-9_-]{43}$/.test(code) || !/^[A-Za-z0-9_-]{43}$/.test(verifier)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 })
  }
  if (rateLimited(`mobile-exchange-request:${requestId}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }

  const now = new Date()
  const authRequest = await db.mobileAuthRequest.findUnique({ where: { id: requestId } })
  if (!authRequest || !authRequest.email || authRequest.expiresAt <= now || authRequest.codeExpiresAt === null ||
      authRequest.codeExpiresAt <= now || authRequest.codeUsedAt || authRequest.codeHash !== hashSecret(code) ||
      authRequest.codeChallenge !== verifierChallenge(verifier)) {
    return NextResponse.json({ error: "invalid_code" }, { status: 401 })
  }

  const user = await db.user.findUnique({ where: { email: authRequest.email } })
  if (!user || user.status === "suspended" || user.status === "deleted") {
    return NextResponse.json({ error: "invalid_code" }, { status: 401 })
  }

  const token = randomSecret()
  const expiresAt = new Date(now.getTime() + MOBILE_SESSION_DAYS * 24 * 60 * 60 * 1000)
  const issued = await db.$transaction(async (tx) => {
    const consumed = await tx.mobileAuthRequest.updateMany({
      where: {
        id: requestId,
        codeHash: hashSecret(code),
        codeExpiresAt: { gt: now },
        expiresAt: { gt: now },
        codeUsedAt: null,
      },
      data: { codeUsedAt: now },
    })
    if (consumed.count !== 1) return false
    await tx.mobileSession.create({
      data: { userId: user.id, tokenHash: hashSecret(token), role: user.role, expiresAt },
    })
    return true
  })
  if (!issued) return NextResponse.json({ error: "invalid_code" }, { status: 401 })

  return NextResponse.json({ accessToken: token, expiresAt }, { headers: { "Cache-Control": "no-store" } })
}

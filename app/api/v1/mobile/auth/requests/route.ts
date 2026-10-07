import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { MOBILE_REQUEST_MINUTES } from "@/lib/mobile-auth"
import { rateLimited } from "@/lib/rate-limit"
import { requestIp } from "@/lib/mobile-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const ip = requestIp(request)
  if (rateLimited(`mobile-auth-request:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 })
  }
  const body = await request.json().catch(() => null)
  const codeChallenge = typeof body?.codeChallenge === "string" ? body.codeChallenge : ""
  if (!/^[A-Za-z0-9_-]{43}$/.test(codeChallenge)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 })
  }
  const authRequest = await db.mobileAuthRequest.create({
    data: {
      codeChallenge,
      expiresAt: new Date(Date.now() + MOBILE_REQUEST_MINUTES * 60 * 1000),
    },
    select: { id: true, expiresAt: true },
  })
  return NextResponse.json(authRequest, { status: 201, headers: { "Cache-Control": "no-store" } })
}

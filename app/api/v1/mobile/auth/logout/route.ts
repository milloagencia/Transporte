import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashSecret } from "@/lib/mobile-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") ?? ""
  const [scheme, token, ...extra] = authorization.trim().split(/\s+/)
  if (scheme?.toLowerCase() === "bearer" && token && !extra.length && /^[A-Za-z0-9_-]{43}$/.test(token)) {
    await db.mobileSession.updateMany({
      where: { tokenHash: hashSecret(token), revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } })
}

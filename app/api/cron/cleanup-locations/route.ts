import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const secret = process.env.LOCATION_CLEANUP_SECRET
  const authorization = request.headers.get("authorization") ?? ""
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : ""
  if (!secret) return NextResponse.json({ error: "cleanup_not_configured" }, { status: 503 })
  const expectedHash = Buffer.from(secret)
  const suppliedHash = Buffer.from(supplied)
  if (expectedHash.length !== suppliedHash.length || !timingSafeEqual(expectedHash, suppliedHash)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const [locations, authRequests, mobileSessions] = await db.$transaction([
    db.driverLocation.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    db.mobileAuthRequest.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.mobileSession.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { revokedAt: { not: null } }] } }),
  ])
  return NextResponse.json({
    deletedLocations: locations.count,
    deletedAuthRequests: authRequests.count,
    deletedMobileSessions: mobileSessions.count,
  })
}

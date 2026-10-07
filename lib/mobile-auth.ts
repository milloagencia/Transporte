import { createHash, randomBytes } from "node:crypto"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import type { SessionUser } from "@/lib/guards"

export const MOBILE_SESSION_DAYS = 30
export const MOBILE_REQUEST_MINUTES = 30
export const MOBILE_CODE_MINUTES = 10

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

export function verifierChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url")
}

export function randomSecret() {
  return randomBytes(32).toString("base64url")
}

export function requestIp(request: Request) {
  return (request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",").at(-1) ?? "unknown")
    .trim()
    .slice(0, 100)
}

export async function getRequestUser(request: Request): Promise<SessionUser | null> {
  const authorization = request.headers.get("authorization")
  if (!authorization) return getSessionUserFromCookie()
  const [scheme, token, ...extra] = authorization.trim().split(/\s+/)
  if (scheme?.toLowerCase() !== "bearer" || !token || extra.length || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null

  const now = new Date()
  const mobileSession = await db.mobileSession.findUnique({
    where: { tokenHash: hashSecret(token) },
    include: { user: { select: { id: true, role: true, status: true, wantsToDrive: true, wantsToShip: true, onboardedAt: true } } },
  })
  if (!mobileSession || mobileSession.revokedAt || mobileSession.expiresAt <= now) return null

  if (mobileSession.user.status === "suspended" || mobileSession.user.status === "deleted" || mobileSession.role !== mobileSession.user.role) {
    await db.mobileSession.updateMany({ where: { id: mobileSession.id, revokedAt: null }, data: { revokedAt: now } })
    return null
  }

  const refreshed = await db.mobileSession.updateMany({
    where: { id: mobileSession.id, revokedAt: null, expiresAt: { gt: now }, role: mobileSession.user.role },
    data: { lastUsedAt: now, expiresAt: new Date(now.getTime() + MOBILE_SESSION_DAYS * 24 * 60 * 60 * 1000) },
  })
  if (refreshed.count !== 1) return null
  return {
    id: mobileSession.user.id,
    role: mobileSession.user.role,
    status: mobileSession.user.status,
    wantsToDrive: mobileSession.user.wantsToDrive,
    wantsToShip: mobileSession.user.wantsToShip,
    onboarded: Boolean(mobileSession.user.onboardedAt),
  }
}

async function getSessionUserFromCookie(): Promise<SessionUser | null> {
  const session = await auth()
  const user = session?.user as Partial<SessionUser> | undefined
  if (!user?.id) return null
  return {
    id: user.id,
    role: user.role ?? "user",
    status: user.status ?? "active",
    wantsToDrive: Boolean(user.wantsToDrive),
    wantsToShip: Boolean(user.wantsToShip),
    onboarded: Boolean(user.onboarded),
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function revokeMobileSessions(userId: string) {
  return db.mobileSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

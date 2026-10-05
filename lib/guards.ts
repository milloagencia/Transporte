import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export type SessionUser = { id: string; role: string; status: string; wantsToDrive: boolean; wantsToShip: boolean; onboarded: boolean }

/** Returns the signed-in user (id + role) or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  const user = session?.user as Partial<SessionUser> | undefined
  if (!user?.id) return null
  return {
    id: user.id, role: user.role ?? "user", status: user.status ?? "active",
    wantsToDrive: Boolean(user.wantsToDrive), wantsToShip: Boolean(user.wantsToShip), onboarded: Boolean(user.onboarded),
  }
}

/**
 * Blocks actions for accounts that are not in good standing.
 * - "create": new offers, requests, deals, proposals, payments → only active accounts
 * - "basic": finishing or cancelling existing trips, reviews → anything but suspended/deleted
 */
export function accountBlock(me: Pick<SessionUser, "status">, level: "create" | "basic" = "create"): NextResponse | null {
  if (me.status === "suspended" || me.status === "deleted") {
    return NextResponse.json({ error: "account_suspended" }, { status: 403 })
  }
  if (level === "create" && me.status === "payment_hold") {
    return NextResponse.json({ error: "account_payment_hold" }, { status: 403 })
  }
  return null
}

/** Signed-in, active-enough user or an error response. */
export async function requireUser(level: "create" | "basic" = "create") {
  const me = await getSessionUser()
  if (!me) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const blocked = accountBlock(me, level)
  return blocked ? { error: blocked } : { me }
}

export async function requireAdmin() {
  const me = await getSessionUser()
  if (!me || me.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  return { me }
}

/** Records an admin action for the audit log. */
export async function logAdmin(adminId: string, action: string, targetType: string, targetId: string, note?: string | null) {
  await db.adminLog.create({ data: { adminId, action, targetType, targetId, note: note?.slice(0, 500) ?? null } })
}

/** Only listings from accounts in good standing are shown. */
export const ACTIVE_OWNER = { status: "active" as const }

/** True when the user has a driver profile approved by an admin. */
export async function isApprovedDriver(userId: string): Promise<boolean> {
  const profile = await db.driverProfile.findUnique({ where: { userId } })
  return profile?.verificationStatus === "approved"
}

/** Copies only the allowed keys from an untrusted request body. */
export function pick<T extends string>(body: unknown, keys: readonly T[]): Partial<Record<T, unknown>> {
  const out: Partial<Record<T, unknown>> = {}
  if (!body || typeof body !== "object") return out
  for (const k of keys) {
    if (k in (body as Record<string, unknown>)) out[k] = (body as Record<string, unknown>)[k]
  }
  return out
}

/** Public display name: never exposes the email address. */
export function publicName(u: { name: string | null }): string {
  return u.name?.trim() || "Usuario"
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logAdmin, requireAdmin } from "@/lib/guards"

const STATUSES = ["active", "payment_hold", "suspended"] as const
const VERIFICATION = ["approved", "rejected", "pending", "expired"] as const

/**
 * Admin actions on a user:
 * - set_status: active | payment_hold (pending payment) | suspended, with a reason
 * - delete: closes the account (anonymized; past deals are kept for records)
 * - verify_driver: approved | rejected | pending | expired
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me, error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : null
  const user = await db.user.findUnique({ where: { id }, include: { driverProfile: true } })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const protectedTarget = user.id === me.id || user.role === "admin"

  switch (body.action) {
    case "set_status": {
      if (protectedTarget) return NextResponse.json({ error: "cannot_modify_admin" }, { status: 400 })
      if (!STATUSES.includes(body.status)) return NextResponse.json({ error: "invalid_option" }, { status: 400 })
      await db.$transaction([
        db.user.update({ where: { id }, data: { status: body.status, statusReason: reason, statusChangedAt: new Date() } }),
        ...(body.status === "suspended" ? [
          db.session.deleteMany({ where: { userId: id } }),
          db.mobileSession.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
        ] : []),
      ])
      await logAdmin(me.id, `user.status.${body.status}`, "user", id, reason)
      return NextResponse.json({ ok: true })
    }
    case "revoke_mobile_sessions": {
      const result = await db.mobileSession.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      await logAdmin(me.id, "user.mobile_sessions.revoke", "user", id, reason)
      return NextResponse.json({ ok: true, revoked: result.count })
    }
    case "delete": {
      if (protectedTarget) return NextResponse.json({ error: "cannot_modify_admin" }, { status: 400 })
      await db.$transaction([
        db.tripOffer.updateMany({ where: { driverId: id, status: { in: ["active", "paused"] } }, data: { status: "cancelled" } }),
        db.tripRequest.updateMany({ where: { requesterId: id, status: { in: ["open", "in_negotiation"] } }, data: { status: "cancelled" } }),
        db.deal.updateMany({
          where: { OR: [{ driverId: id }, { requesterId: id }], status: { in: ["negotiating", "accepted_pending_payment"] } },
          data: { status: "cancelled" },
        }),
        db.vehicle.updateMany({ where: { ownerId: id }, data: { active: false } }),
        db.session.deleteMany({ where: { userId: id } }),
        db.mobileSession.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } }),
        db.account.deleteMany({ where: { userId: id } }),
        db.user.update({
          where: { id },
          data: {
            status: "deleted", statusReason: reason, statusChangedAt: new Date(),
            name: "Usuario eliminado", email: `deleted-${id}@deleted.invalid`, image: null,
          },
        }),
      ])
      if (user.driverProfile) {
        await db.driverProfile.update({ where: { userId: id }, data: { verificationStatus: "rejected", licenseNote: null, insuranceNote: null, inspectionNote: null } })
      }
      await logAdmin(me.id, "user.delete", "user", id, reason)
      return NextResponse.json({ ok: true })
    }
    case "verify_driver": {
      if (!VERIFICATION.includes(body.status)) return NextResponse.json({ error: "invalid_option" }, { status: 400 })
      const nextRole = user.role === "admin" ? "admin" : body.status === "approved" ? "driver" : "user"
      await db.$transaction(async (tx) => {
        await tx.driverProfile.upsert({
          where: { userId: id },
          update: { verificationStatus: body.status, adminNote: reason },
          create: { userId: id, verificationStatus: body.status, adminNote: reason },
        })
        if (nextRole !== user.role) {
          await tx.user.update({ where: { id }, data: { role: nextRole } })
          await tx.mobileSession.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } })
        }
      })
      await logAdmin(me.id, `driver.${body.status}`, "user", id, reason)
      return NextResponse.json({ ok: true })
    }
  }
  return NextResponse.json({ error: "invalid_option" }, { status: 400 })
}

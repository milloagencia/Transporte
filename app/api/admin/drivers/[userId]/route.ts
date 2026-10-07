import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { userId } = await params
  const body = await req.json()
  if (!["approved", "rejected", "pending", "expired"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }
  const profile = await db.driverProfile.update({
    where: { userId },
    data: { verificationStatus: body.status, adminNote: body.adminNote },
  })
  // Keep the user's role in sync (never downgrade an admin)
  const target = await db.user.findUnique({ where: { id: userId } })
  const nextRole = target && target.role !== "admin" ? body.status === "approved" ? "driver" : "user" : target?.role
  if (target && nextRole && nextRole !== target.role) {
    await db.$transaction([
      db.user.update({ where: { id: userId }, data: { role: nextRole } }),
      db.mobileSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ])
  }
  return NextResponse.json(profile)
}

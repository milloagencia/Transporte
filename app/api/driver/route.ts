import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUser, accountBlock } from "@/lib/guards"

/** Request (or re-request) driver verification. Status goes back to "pending" for admin review. */
export async function POST(req: Request) {
  const me = await getSessionUser()
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const blocked = accountBlock(me, "create")
  if (blocked) return blocked
  const body = await req.json().catch(() => ({}))
  const notes = {
    licenseNote: typeof body.licenseNote === "string" ? body.licenseNote.slice(0, 500) : undefined,
    insuranceNote: typeof body.insuranceNote === "string" ? body.insuranceNote.slice(0, 500) : undefined,
    inspectionNote: typeof body.inspectionNote === "string" ? body.inspectionNote.slice(0, 500) : undefined,
  }
  if (!notes.licenseNote || !notes.insuranceNote || !notes.inspectionNote) {
    return NextResponse.json({ error: "License, insurance and inspection info are required" }, { status: 400 })
  }
  const existing = await db.driverProfile.findUnique({ where: { userId: me.id } })
  if (existing?.verificationStatus === "approved") {
    return NextResponse.json({ error: "Already approved" }, { status: 400 })
  }
  const profile = await db.driverProfile.upsert({
    where: { userId: me.id },
    update: { ...notes, verificationStatus: "pending" },
    create: { userId: me.id, ...notes },
  })
  return NextResponse.json(profile, { status: 201 })
}

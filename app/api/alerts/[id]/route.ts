import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/guards"

async function own(id: string) {
  const me = await getSessionUser()
  if (!me) return null
  const alert = await db.tripAlert.findUnique({ where: { id } })
  return alert && alert.userId === me.id ? alert : null
}

/** Pause or resume one of my alerts. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const alert = await own((await params).id)
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const body = await req.json().catch(() => ({}))
  return NextResponse.json(await db.tripAlert.update({ where: { id: alert.id }, data: { active: Boolean(body.active) } }))
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const alert = await own((await params).id)
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await db.tripAlert.delete({ where: { id: alert.id } })
  return NextResponse.json({ ok: true })
}

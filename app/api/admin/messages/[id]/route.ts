import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/guards"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  const body = await req.json().catch(() => ({}))
  await db.contactMessage.update({ where: { id: (await params).id }, data: { read: body.action !== "unread" } })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin()
  if (error) return error
  await db.contactMessage.delete({ where: { id: (await params).id } })
  return NextResponse.json({ ok: true })
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logAdmin, requireAdmin } from "@/lib/guards"

/** Admin moderation: approve/reject the comment, or hide/unhide the whole review (stars included). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { me, error } = await requireAdmin()
  if (error) return error
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const note = typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : null
  const review = await db.review.findUnique({ where: { id } })
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const data =
    body.action === "approve" ? { commentStatus: "approved" as const } :
    body.action === "reject" ? { commentStatus: "rejected" as const } :
    body.action === "hide" ? { hidden: true } :
    body.action === "unhide" ? { hidden: false } : null
  if (!data) return NextResponse.json({ error: "invalid_option" }, { status: 400 })
  await db.review.update({ where: { id }, data: { ...data, moderationNote: note, moderatedAt: new Date() } })
  await logAdmin(me.id, `review.${body.action}`, "review", id, note)
  return NextResponse.json({ ok: true })
}

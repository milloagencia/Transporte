import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const request = await db.tripRequest.findUnique({
    where: { id },
    include: { requester: { select: { id: true, name: true, email: true } } },
  })
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(request)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const userId = (session.user as { id: string }).id
  const existing = await db.tripRequest.findUnique({ where: { id } })
  if (!existing || existing.requesterId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const body = await req.json()
  return NextResponse.json(await db.tripRequest.update({ where: { id }, data: body }))
}

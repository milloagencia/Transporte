import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const offer = await db.tripOffer.findUnique({
    where: { id },
    include: { driver: { select: { id: true, name: true, email: true } } },
  })
  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(offer)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const userId = (session.user as { id: string }).id
  const offer = await db.tripOffer.findUnique({ where: { id } })
  if (!offer || offer.driverId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const body = await req.json()
  return NextResponse.json(await db.tripOffer.update({ where: { id }, data: body }))
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const userId = (session.user as { id: string }).id
  const offer = await db.tripOffer.findUnique({ where: { id } })
  if (!offer || offer.driverId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  await db.tripOffer.update({ where: { id }, data: { status: "cancelled" } })
  return NextResponse.json({ ok: true })
}

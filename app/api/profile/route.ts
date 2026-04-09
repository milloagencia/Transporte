import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const user = await db.user.findUnique({ where: { id: userId }, include: { driverProfile: true } })
  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = (session.user as { id: string }).id
  const body = await req.json()
  const user = await db.user.update({
    where: { id: userId },
    data: { name: body.name, language: body.language },
  })
  return NextResponse.json(user)
}

import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  return NextResponse.json(await db.platformConfig.findMany())
}

export async function PATCH(req: Request) {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const body = await req.json() as Record<string, string>
  await Promise.all(
    Object.entries(body).map(([key, value]) =>
      db.platformConfig.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  )
  return NextResponse.json({ ok: true })
}

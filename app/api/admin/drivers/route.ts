import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const drivers = await db.driverProfile.findMany({
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(drivers)
}

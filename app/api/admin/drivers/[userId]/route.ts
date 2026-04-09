import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { userId } = await params
  const body = await req.json()
  const profile = await db.driverProfile.update({
    where: { userId },
    data: { verificationStatus: body.status, adminNote: body.adminNote },
  })
  return NextResponse.json(profile)
}

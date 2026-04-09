import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      driver: { select: { id: true, name: true, email: true } },
      requester: { select: { id: true, name: true, email: true } },
      proposals: {
        include: { proposedBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
      payment: true,
      completion: true,
    },
  })
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(deal)
}

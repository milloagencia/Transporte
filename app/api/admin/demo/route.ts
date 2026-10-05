import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/guards"
import { clearDemo, seedDemo } from "@/prisma/demo-data.mjs"

async function requireAdmin() {
  const me = await getSessionUser()
  return me?.role === "admin"
}

/** Recreate the demo data with fresh dates. */
export async function POST() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  return NextResponse.json(await seedDemo(db))
}

/** Remove all demo users and everything they own. */
export async function DELETE() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  return NextResponse.json({ removedUsers: await clearDemo(db) })
}

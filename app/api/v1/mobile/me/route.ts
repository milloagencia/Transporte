import { NextResponse } from "next/server"
import { getRequestUser, unauthorized } from "@/lib/mobile-auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const me = await getRequestUser(request)
  if (!me) return unauthorized()
  return NextResponse.json(
    { id: me.id, role: me.role, status: me.status, wantsToDrive: me.wantsToDrive, wantsToShip: me.wantsToShip },
    { headers: { "Cache-Control": "no-store" } },
  )
}

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SITE_URL } from "@/lib/seo-content"

/** One-click unsubscribe link from alert emails (no login needed). */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? ""
  const alert = token ? await db.tripAlert.findUnique({ where: { unsubscribeToken: token } }) : null
  if (alert) await db.tripAlert.update({ where: { id: alert.id }, data: { active: false } })
  return NextResponse.redirect(`${SITE_URL}/unsubscribed${alert ? "" : "?invalid=1"}`)
}

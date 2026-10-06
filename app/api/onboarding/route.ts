import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireUser } from "@/lib/guards"

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "")

/**
 * Saves who the user is and what they want to do:
 * - wantsToShip: needs transport (travel or send cargo)
 * - wantsToDrive: offers transport (has a vehicle)
 * - accountType: individual or company (company name becomes the public name)
 */
export async function POST(req: Request) {
  const { me, error } = await requireUser("basic")
  if (error) return error
  const b = await req.json().catch(() => ({}))
  const wantsToShip = Boolean(b.wantsToShip)
  const wantsToDrive = Boolean(b.wantsToDrive)
  if (!wantsToShip && !wantsToDrive) return NextResponse.json({ error: "onboarding_intent" }, { status: 400 })
  const accountType = b.accountType === "company" ? "company" : "individual"
  const personName = clean(b.name, 80)
  const companyName = clean(b.companyName, 100)
  if (personName.length < 2) return NextResponse.json({ error: "onboarding_name" }, { status: 400 })
  if (accountType === "company" && companyName.length < 2) return NextResponse.json({ error: "onboarding_company" }, { status: 400 })
  const phoneDigits = clean(b.phone, 20).replace(/[^\d+]/g, "")
  if (phoneDigits && !/^\+?1?\d{10}$/.test(phoneDigits)) return NextResponse.json({ error: "onboarding_phone" }, { status: 400 })
  const usdot = clean(b.usdotNumber, 12).replace(/\D/g, "")

  const user = await db.user.update({
    where: { id: me.id },
    data: {
      wantsToShip, wantsToDrive, accountType,
      // Public name: the company for businesses, the person otherwise
      name: accountType === "company" ? companyName : personName,
      contactName: accountType === "company" ? personName : null,
      phone: phoneDigits || null,
      usdotNumber: accountType === "company" && wantsToDrive && usdot ? usdot : null,
      language: b.language === "en" ? "en" : "es",
      onboardedAt: new Date(),
    },
  })
  return NextResponse.json({ ok: true, wantsToDrive: user.wantsToDrive })
}

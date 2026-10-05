import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getSessionUser } from "@/lib/guards"
import OnboardingForm from "./OnboardingForm"

export const metadata = { robots: { index: false } }

/** First step after signing in: choose what you want to do and who you are. Also used to edit it later. */
export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ as?: string }> }) {
  const me = await getSessionUser()
  if (!me) redirect("/auth/signin")
  const { as } = await searchParams
  const user = await db.user.findUnique({ where: { id: me.id } })
  if (!user) redirect("/auth/signin")
  const firstTime = !user.onboardedAt
  if (!firstTime && as) redirect("/dashboard")
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <OnboardingForm
        firstTime={firstTime}
        initial={{
          wantsToShip: firstTime ? as !== "driver" : user.wantsToShip,
          wantsToDrive: firstTime ? as === "driver" : user.wantsToDrive,
          accountType: user.accountType,
          name: (user.accountType === "company" ? user.contactName : user.name) ?? "",
          companyName: user.accountType === "company" ? user.name ?? "" : "",
          phone: user.phone ?? "",
          usdotNumber: user.usdotNumber ?? "",
          language: user.language === "en" ? "en" : "es",
        }}
      />
    </div>
  )
}

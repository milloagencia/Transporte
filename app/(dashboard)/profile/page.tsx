import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProfileForm from "@/components/profile-form"
import DriverApplicationForm from "@/components/driver-application-form"
import { getTranslations } from "next-intl/server"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = (session.user as { id: string }).id
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { driverProfile: true },
  })
  if (!user) return null
  const t = await getTranslations("profile")
  const ts = await getTranslations("status")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader><CardTitle>{t("title")}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm"><strong>{t("email")}:</strong> {user.email}</p>
          <p className="text-sm"><strong>{t("role")}:</strong> <Badge>{ts(`role_${user.role}`)}</Badge></p>
          <p className="text-sm">
            {user.accountType === "company" ? `🏢 ${user.name}${user.contactName ? ` (${user.contactName})` : ""}` : "🙋"}
            {user.wantsToShip && " · 📦"}{user.wantsToDrive && " · 🚚"}
            {user.phone && ` · ☎ ${user.phone}`}
          </p>
          <a href="/onboarding" className="text-sm text-blue-700 hover:underline">✎ {t("accountType")}</a>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t("edit")}</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm name={user.name} language={user.language} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t("driverStatus")}</CardTitle></CardHeader>
        <CardContent>
          {user.driverProfile ? (
            <div className="space-y-2">
              <Badge variant={
                user.driverProfile.verificationStatus === "approved" ? "success" :
                user.driverProfile.verificationStatus === "rejected" ? "destructive" : "warning"
              }>
                {ts(user.driverProfile.verificationStatus)}
              </Badge>
              {user.driverProfile.adminNote && (
                <p className="text-sm text-gray-600">{t("adminNote")}: {user.driverProfile.adminNote}</p>
              )}
              {["rejected", "expired"].includes(user.driverProfile.verificationStatus) && <DriverApplicationForm />}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{t("mustVerify")}</p>
              <DriverApplicationForm />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

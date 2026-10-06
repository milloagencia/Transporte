import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProfileForm from "@/components/profile-form"
import DriverApplicationForm from "@/components/driver-application-form"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = (session.user as { id: string }).id
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { driverProfile: true },
  })
  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm"><strong>Email:</strong> {user.email}</p>
          <p className="text-sm"><strong>Role:</strong> <Badge>{user.role}</Badge></p>
          <p className="text-sm">
            {user.accountType === "company" ? `🏢 ${user.name}${user.contactName ? ` (${user.contactName})` : ""}` : "🙋"}
            {user.wantsToShip && " · 📦"}{user.wantsToDrive && " · 🚚"}
            {user.phone && ` · ☎ ${user.phone}`}
          </p>
          <a href="/onboarding" className="text-sm text-blue-700 hover:underline">✎ Tipo de cuenta / datos</a>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
        <CardContent>
          <ProfileForm name={user.name} language={user.language} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Driver Status</CardTitle></CardHeader>
        <CardContent>
          {user.driverProfile ? (
            <div className="space-y-2">
              <Badge variant={
                user.driverProfile.verificationStatus === "approved" ? "success" :
                user.driverProfile.verificationStatus === "rejected" ? "destructive" : "warning"
              }>
                {user.driverProfile.verificationStatus}
              </Badge>
              {user.driverProfile.adminNote && (
                <p className="text-sm text-gray-600">Admin note: {user.driverProfile.adminNote}</p>
              )}
              {["rejected", "expired"].includes(user.driverProfile.verificationStatus) && <DriverApplicationForm />}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">To publish trip offers you must be a verified driver.</p>
              <DriverApplicationForm />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

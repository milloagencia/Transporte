import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminActions from "./AdminActions"

export default async function AdminPage() {
  const session = await auth()
  const user = session?.user as { role?: string } | undefined
  if (user?.role !== "admin") redirect("/dashboard")

  const [pendingDrivers, config] = await Promise.all([
    db.driverProfile.findMany({
      where: { verificationStatus: "pending" },
      include: { user: { select: { id: true, email: true, name: true } } },
    }),
    db.platformConfig.findMany(),
  ])

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <Card>
        <CardHeader><CardTitle>Driver Verification Queue ({pendingDrivers.length})</CardTitle></CardHeader>
        <CardContent>
          {pendingDrivers.length === 0 ? (
            <p className="text-sm text-gray-500">No pending verifications.</p>
          ) : (
            <ul className="space-y-3">
              {pendingDrivers.map((dp) => (
                <li key={dp.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{dp.user.name ?? dp.user.email}</p>
                    <Badge variant="warning">{dp.verificationStatus}</Badge>
                  </div>
                  <AdminActions userId={dp.user.id} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Platform Config</CardTitle></CardHeader>
        <CardContent>
          {config.length === 0 ? (
            <p className="text-sm text-gray-500">No config entries yet.</p>
          ) : (
            <ul className="space-y-1">
              {config.map((c) => (
                <li key={c.key} className="text-sm"><strong>{c.key}:</strong> {c.value}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

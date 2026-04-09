import { db } from "@/lib/db"
import { auth } from "@/auth"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function DealsPage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = (session.user as { id: string }).id

  const deals = await db.deal.findMany({
    where: { OR: [{ driverId: userId }, { requesterId: userId }] },
    include: {
      driver: { select: { name: true, email: true } },
      requester: { select: { name: true, email: true } },
      proposals: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Deals</h1>
      {deals.length === 0 ? (
        <p className="text-gray-500">No deals yet. Browse offers or requests to start one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {deals.map((d) => (
            <Link key={d.id} href={`/deals/${d.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader><CardTitle className="text-base">Deal #{d.id.slice(-8)}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant={d.status === "completed" ? "success" : d.status === "cancelled" ? "destructive" : "default"}>
                    {d.status}
                  </Badge>
                  <p className="text-sm">Driver: {d.driver.name ?? d.driver.email}</p>
                  <p className="text-sm">Requester: {d.requester.name ?? d.requester.email}</p>
                  {d.proposals[0] && <p className="text-sm">Latest proposal: ${d.proposals[0].price}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

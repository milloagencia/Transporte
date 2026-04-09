import { db } from "@/lib/db"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function RequestsPage() {
  const requests = await db.tripRequest.findMany({
    where: { status: "open" },
    include: { requester: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trip Requests</h1>
        <Link href="/requests/new"><Button>Post New Request</Button></Link>
      </div>
      {requests.length === 0 ? (
        <p className="text-gray-500">No requests yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="text-base">{r.originCity}, {r.originState} → {r.destCity}, {r.destState}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Badge>{r.serviceType}</Badge>
                  <Badge variant="secondary">{r.exclusivity}</Badge>
                </div>
                {r.budgetProposed && <p className="text-sm">Budget: <strong>${r.budgetProposed}</strong></p>}
                <p className="text-sm">By: {r.requester.name ?? r.requester.email}</p>
                <Link href={`/requests/${r.id}`}><Button size="sm" className="w-full mt-2">View Details</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

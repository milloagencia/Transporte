import { db } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import StartDealFromRequestButton from "./StartDealFromRequestButton"

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const request = await db.tripRequest.findUnique({
    where: { id },
    include: { requester: { select: { id: true, name: true, email: true } } },
  })
  if (!request) notFound()
  const currentUserId = (session?.user as { id?: string } | undefined)?.id

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{request.originCity}, {request.originState} → {request.destCity}, {request.destState}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Badge>{request.serviceType}</Badge>
            <Badge variant="secondary">{request.exclusivity}</Badge>
          </div>
          {request.budgetProposed && <p className="text-sm"><strong>Budget:</strong> ${request.budgetProposed}</p>}
          <p className="text-sm"><strong>Requester:</strong> {request.requester.name ?? request.requester.email}</p>
          <p className="text-sm"><strong>Window:</strong> {new Date(request.windowFrom).toLocaleString()} – {new Date(request.windowTo).toLocaleString()}</p>
          {currentUserId && currentUserId !== request.requester.id && (
            <StartDealFromRequestButton requestId={request.id} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

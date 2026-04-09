import { db } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DealActions from "./DealActions"

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      driver: { select: { id: true, name: true, email: true } },
      requester: { select: { id: true, name: true, email: true } },
      proposals: {
        include: { proposedBy: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
      payment: true,
      completion: true,
    },
  })
  if (!deal) notFound()

  const currentUserId = (session?.user as { id?: string } | undefined)?.id
  const isDriver = currentUserId === deal.driver.id
  const isRequester = currentUserId === deal.requesterId

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader><CardTitle>Deal #{deal.id.slice(-8)}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Badge variant={deal.status === "completed" ? "success" : deal.status === "cancelled" ? "destructive" : "default"}>
            {deal.status}
          </Badge>
          <p className="text-sm"><strong>Driver:</strong> {deal.driver.name ?? deal.driver.email}</p>
          <p className="text-sm"><strong>Requester:</strong> {deal.requester.name ?? deal.requester.email}</p>
          {deal.finalPrice && <p className="text-sm"><strong>Final Price:</strong> ${deal.finalPrice}</p>}
          {(isDriver || isRequester) && currentUserId && (
            <DealActions
              dealId={deal.id}
              status={deal.status}
              proposals={deal.proposals.map((p) => ({
                id: p.id,
                status: p.status,
                price: p.price,
                proposedById: p.proposedById,
              }))}
              currentUserId={currentUserId}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Proposal History</CardTitle></CardHeader>
        <CardContent>
          {deal.proposals.length === 0 ? (
            <p className="text-sm text-gray-500">No proposals yet.</p>
          ) : (
            <ul className="space-y-3">
              {deal.proposals.map((p) => (
                <li key={p.id} className="border-b pb-2 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">${p.price}</span>
                    <Badge variant={p.status === "accepted" ? "success" : p.status === "rejected" ? "destructive" : "secondary"}>
                      {p.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    By {p.proposedBy.name ?? p.proposedBy.email} · {new Date(p.createdAt).toLocaleString()}
                  </p>
                  {p.message && <p className="text-sm text-gray-700 mt-1">{p.message}</p>}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

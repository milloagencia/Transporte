"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Proposal {
  id: string
  status: string
  price: number
  proposedById: string
}

export default function DealActions({
  dealId,
  status,
  proposals,
  currentUserId,
}: {
  dealId: string
  status: string
  proposals: Proposal[]
  currentUserId: string
}) {
  const router = useRouter()
  const [price, setPrice] = useState("")
  const [message, setMessage] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const latest = proposals[0]

  async function post(url: string, body?: object) {
    setLoading(true)
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-3 border-t pt-3">
      {status === "negotiating" && (
        <>
          <div className="space-y-2">
            <Label>Make Proposal</Label>
            <Input
              type="number" step="0.01" placeholder="Price ($)"
              value={price} onChange={(e) => setPrice(e.target.value)}
            />
            <Textarea
              placeholder="Message (optional)"
              value={message} onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              size="sm" disabled={loading || !price}
              onClick={() => post(`/api/deals/${dealId}/proposals`, { price: parseFloat(price), message })}
            >
              Submit Proposal
            </Button>
          </div>
          {latest && latest.status === "pending" && latest.proposedById !== currentUserId && (
            <Button
              size="sm" variant="outline" disabled={loading}
              onClick={() => post(`/api/deals/${dealId}/proposals/${latest.id}/accept`)}
            >
              Accept ${latest.price}
            </Button>
          )}
        </>
      )}
      {status === "accepted_pending_payment" && (
        <Button className="w-full" disabled={loading} onClick={() => post(`/api/deals/${dealId}/pay`)}>
          Pay (Simulated)
        </Button>
      )}
      {status === "paid_escrow" && (
        <Button variant="outline" className="w-full" disabled={loading} onClick={() => post(`/api/deals/${dealId}/complete`)}>
          Confirm Completed
        </Button>
      )}
      {["negotiating", "accepted_pending_payment"].includes(status) && (
        <div className="space-y-2">
          <Input placeholder="Cancellation reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button
            variant="destructive" size="sm" disabled={loading}
            onClick={() => post(`/api/deals/${dealId}/cancel`, { reason })}
          >
            Cancel Deal
          </Button>
        </div>
      )}
    </div>
  )
}

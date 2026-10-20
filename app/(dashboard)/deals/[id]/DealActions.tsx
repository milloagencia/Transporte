"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useErrorMessage } from "@/components/form-helpers"

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
  isRequester,
}: {
  dealId: string
  status: string
  proposals: Proposal[]
  currentUserId: string
  isRequester: boolean
}) {
  const router = useRouter()
  const t = useTranslations("deals")
  const errorMessage = useErrorMessage()
  const [price, setPrice] = useState("")
  const [message, setMessage] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const latest = proposals[0]

  async function post(url: string, body?: object): Promise<boolean> {
    setLoading(true)
    setError("")
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null)
    setLoading(false)
    if (!res?.ok) {
      const code = res ? (await res.json().catch(() => ({}))).error : undefined
      setError(errorMessage(code))
      return false
    }
    router.refresh()
    return true
  }

  async function submitProposal() {
    const ok = await post(`/api/deals/${dealId}/proposals`, { price: parseFloat(price), message })
    if (ok) {
      setPrice("")
      setMessage("")
    }
  }

  const theyProposed = latest && latest.status === "pending" && latest.proposedById !== currentUserId
  const iProposed = latest && latest.status === "pending" && latest.proposedById === currentUserId

  return (
    <div className="space-y-3 border-t pt-3">
      {status === "negotiating" && (
        <>
          {theyProposed && (
            <Button
              className="w-full" disabled={loading}
              onClick={() => post(`/api/deals/${dealId}/proposals/${latest.id}/accept`)}
            >
              {t("acceptPrice", { price: latest.price })}
            </Button>
          )}
          {iProposed && <p className="text-sm text-gray-600">{t("waitingOther")}</p>}
          <div className="space-y-2">
            <Label>{theyProposed ? t("counter") : t("makeProposal")}</Label>
            <Input
              type="number" step="0.01" placeholder={t("pricePlaceholder")}
              value={price} onChange={(e) => setPrice(e.target.value)}
            />
            <Textarea
              placeholder={t("messagePlaceholder")}
              value={message} onChange={(e) => setMessage(e.target.value)}
            />
            <Button size="sm" variant={theyProposed ? "outline" : "default"} disabled={loading || !price} onClick={submitProposal}>
              {t("submitProposal")}
            </Button>
          </div>
        </>
      )}
      {status === "accepted_pending_payment" && (
        isRequester ? (
          <Button className="w-full" disabled={loading} onClick={() => post(`/api/deals/${dealId}/pay`)}>
            {t("pay")}
          </Button>
        ) : (
          <p className="rounded-md bg-blue-50 p-2 text-sm text-blue-900">{t("payHint")}</p>
        )
      )}
      {status === "paid_escrow" && (
        <Button variant="outline" className="w-full" disabled={loading} onClick={() => post(`/api/deals/${dealId}/complete`)}>
          {t("confirmComplete")}
        </Button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {["negotiating", "accepted_pending_payment"].includes(status) && (
        <div className="space-y-2 pt-2">
          <Input placeholder={t("cancelReason")} value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button
            variant="destructive" size="sm" disabled={loading}
            onClick={() => post(`/api/deals/${dealId}/cancel`, { reason })}
          >
            {t("cancel")}
          </Button>
        </div>
      )}
    </div>
  )
}

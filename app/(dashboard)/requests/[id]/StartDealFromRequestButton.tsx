"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useErrorMessage } from "@/components/form-helpers"

export default function StartDealFromRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter()
  const t = useTranslations("deals")
  const errorMessage = useErrorMessage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleClick() {
    setLoading(true)
    setError("")
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripRequestId: requestId }),
    })
    if (res.ok) {
      const d = await res.json()
      router.push(`/deals/${d.id}`)
    } else {
      setError(errorMessage((await res.json().catch(() => ({}))).error))
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={loading} className="w-full">
        {loading ? t("starting") : t("start")}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { useErrorMessage } from "@/components/form-helpers"

export default function StartDealButton({ offerId }: { offerId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const t = useTranslations("deals")
  const errorMessage = useErrorMessage()

  async function handleClick() {
    setLoading(true)
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripOfferId: offerId }),
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

"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function StartDealFromRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripRequestId: requestId }),
    })
    if (res.ok) {
      const d = await res.json()
      router.push(`/deals/${d.id}`)
    } else {
      alert("Error")
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="w-full">
      {loading ? "Starting..." : "Start Deal"}
    </Button>
  )
}

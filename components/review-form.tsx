"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useErrorMessage } from "@/components/form-helpers"

export default function ReviewForm({ dealId, otherName }: { dealId: string; otherName: string }) {
  const t = useTranslations("reviews")
  const errorMessage = useErrorMessage()
  const router = useRouter()
  const [stars, setStars] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!stars) return setError(t("pickStars"))
    setSaving(true)
    setError("")
    const res = await fetch(`/api/deals/${dealId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stars, comment }),
    })
    if (res.ok) router.refresh()
    else setError(errorMessage((await res.json().catch(() => ({}))).error))
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm">{t("rate", { name: otherName })}</p>
      <div className="flex gap-1 text-3xl" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n}`}
            className={(hover || stars) >= n ? "text-amber-500" : "text-slate-300"}
            onMouseEnter={() => setHover(n)}
            onClick={() => setStars(n)}
          >
            ★
          </button>
        ))}
      </div>
      <Textarea value={comment} maxLength={1000} onChange={(e) => setComment(e.target.value)} placeholder={t("commentPlaceholder")} />
      <p className="text-xs text-slate-500">{t("moderationNote")}</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving}>{saving ? t("sending") : t("send")}</Button>
    </form>
  )
}

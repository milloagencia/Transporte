"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { useErrorMessage } from "@/components/form-helpers"

export default function DriverApplicationForm() {
  const router = useRouter()
  const t = useTranslations("profile")
  const errorMessage = useErrorMessage()
  const [form, setForm] = useState({ licenseNote: "", insuranceNote: "", inspectionNote: "" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const res = await fetch("/api/driver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) router.refresh()
    else setError(errorMessage((await res.json().catch(() => ({}))).error))
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="license">{t("license")}</Label>
        <Input id="license" required value={form.licenseNote} onChange={(e) => set("licenseNote", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="insurance">{t("insurance")}</Label>
        <Input id="insurance" required value={form.insuranceNote} onChange={(e) => set("insuranceNote", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="inspection">{t("inspection")}</Label>
        <Input id="inspection" required value={form.inspectionNote} onChange={(e) => set("inspectionNote", e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving}>{saving ? t("sending") : t("requestVerification")}</Button>
    </form>
  )
}

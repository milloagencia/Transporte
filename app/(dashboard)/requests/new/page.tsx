"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StateSelect, localToIso, nowLocalInput, useErrorMessage } from "@/components/form-helpers"

export default function NewRequestPage() {
  const t = useTranslations("trip")
  const tv = useTranslations("vehicles")
  const router = useRouter()
  const errorMessage = useErrorMessage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    originCity: "", originState: "NE", destCity: "", destState: "NE",
    windowFrom: "", windowTo: "", serviceType: "people", exclusivity: "either",
    passengerCount: "1", cargoWeightLbs: "", cargoLengthIn: "", cargoWidthIn: "", cargoHeightIn: "",
    cargoPieces: "1", cargoDesc: "", coldChainRequired: "none", budgetProposed: "",
  })
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const cargo = form.serviceType === "cargo"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, windowFrom: localToIso(form.windowFrom), windowTo: localToIso(form.windowTo) }),
    })
    if (res.ok) {
      const d = await res.json()
      router.push(`/requests/${d.id}`)
    } else {
      setError(errorMessage((await res.json().catch(() => ({}))).error))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader><CardTitle>{t("newRequest")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1"><Label>{t("origin")}</Label><Input value={form.originCity} onChange={(e) => set("originCity", e.target.value)} minLength={2} maxLength={80} required /></div>
              <div className="space-y-1"><Label>{t("state")}</Label><StateSelect value={form.originState} onChange={(v) => set("originState", v)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1"><Label>{t("destination")}</Label><Input value={form.destCity} onChange={(e) => set("destCity", e.target.value)} minLength={2} maxLength={80} required /></div>
              <div className="space-y-1"><Label>{t("state")}</Label><StateSelect value={form.destState} onChange={(v) => set("destState", v)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>{t("from")}</Label><Input type="datetime-local" min={nowLocalInput()} value={form.windowFrom} onChange={(e) => set("windowFrom", e.target.value)} required /></div>
              <div className="space-y-1"><Label>{t("to")}</Label><Input type="datetime-local" min={form.windowFrom || nowLocalInput()} value={form.windowTo} onChange={(e) => set("windowTo", e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t("service")}</Label>
                <Select value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)}>
                  <option value="people">{t("people")}</option>
                  <option value="cargo">{t("cargo")}</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t("exclusivity")}</Label>
                <Select value={form.exclusivity} onChange={(e) => set("exclusivity", e.target.value)}>
                  <option value="exclusive">{t("exclusive")}</option>
                  <option value="shared">{t("shared")}</option>
                  <option value="either">{t("either")}</option>
                </Select>
              </div>
            </div>

            {!cargo ? (
              <div className="space-y-1">
                <Label>{t("passengers")}</Label>
                <Input type="number" min={1} max={60} value={form.passengerCount} onChange={(e) => set("passengerCount", e.target.value)} required />
              </div>
            ) : (
              <div className="space-y-3 rounded-md border border-gray-200 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>{t("cargoWeight")}</Label><Input type="number" min={1} max={80000} value={form.cargoWeightLbs} onChange={(e) => set("cargoWeightLbs", e.target.value)} required /></div>
                  <div className="space-y-1"><Label>{t("cargoPieces")}</Label><Input type="number" min={1} value={form.cargoPieces} onChange={(e) => set("cargoPieces", e.target.value)} required /></div>
                </div>
                <p className="text-sm font-medium">{t("cargoDims")}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1"><Label>{tv("length")}</Label><Input type="number" step="0.1" min={1} max={720} value={form.cargoLengthIn} onChange={(e) => set("cargoLengthIn", e.target.value)} required /></div>
                  <div className="space-y-1"><Label>{tv("width")}</Label><Input type="number" step="0.1" min={1} max={120} value={form.cargoWidthIn} onChange={(e) => set("cargoWidthIn", e.target.value)} required /></div>
                  <div className="space-y-1"><Label>{tv("height")}</Label><Input type="number" step="0.1" min={1} max={160} value={form.cargoHeightIn} onChange={(e) => set("cargoHeightIn", e.target.value)} required /></div>
                </div>
                <div className="space-y-1">
                  <Label>{t("coldRequired")}</Label>
                  <Select value={form.coldChainRequired} onChange={(e) => set("coldChainRequired", e.target.value)}>
                    <option value="none">{tv("cold_none")}</option>
                    <option value="cooler_ice">{tv("cold_cooler_ice")}</option>
                    <option value="active_refrigeration">{tv("cold_active_refrigeration")}</option>
                  </Select>
                </div>
                <div className="space-y-1"><Label>{t("cargoDesc")}</Label><Textarea value={form.cargoDesc} onChange={(e) => set("cargoDesc", e.target.value)} /></div>
              </div>
            )}

            <div className="space-y-1"><Label>{t("budget")}</Label><Input type="number" step="0.01" min={1} max={100000} value={form.budgetProposed} onChange={(e) => set("budgetProposed", e.target.value)} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? t("posting") : t("postRequest")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

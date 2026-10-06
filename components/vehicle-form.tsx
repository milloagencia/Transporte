"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/select"
import { StateSelect, useErrorMessage } from "@/components/form-helpers"

type CatalogModel = {
  id: string
  make: string
  model: string
  variant: string
  category: string
  seats: number
  cargoLengthIn: number
  cargoWidthIn: number
  cargoHeightIn: number | null
  openTop: boolean
  payloadLbs: number
}

const CATEGORIES = ["sedan", "suv", "suv_3row", "minivan", "pickup", "cargo_van", "passenger_van", "box_truck", "trailer", "other"]
const COLD = ["none", "cooler_ice", "active_refrigeration"]
const OTHER = "__other__"

const empty = {
  vehicleModelId: "", make: "", model: "", year: "", plateNumber: "", plateState: "NE", color: "", category: "other", seats: "",
  cargoLengthIn: "", cargoWidthIn: "", cargoHeightIn: "", openTop: false, payloadLbs: "", coldChain: "none",
}

export default function VehicleForm() {
  const t = useTranslations("vehicles")
  const router = useRouter()
  const [catalog, setCatalog] = useState<CatalogModel[]>([])
  const [make, setMake] = useState("")
  const [form, setForm] = useState(empty)
  const [modelChoice, setModelChoice] = useState("")
  const errorMessage = useErrorMessage()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const set = (k: keyof typeof empty, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch("/api/vehicle-models").then((r) => r.json()).then(setCatalog).catch(() => setCatalog([]))
  }, [])

  const makes = useMemo(() => Array.from(new Set(catalog.map((m) => m.make))).sort((a, b) => a.localeCompare(b)), [catalog])
  const models = catalog.filter((m) => m.make === make)
  const fromCatalog = modelChoice !== "" && modelChoice !== OTHER
  const manual = make === OTHER || modelChoice === OTHER

  function pickModel(id: string) {
    setModelChoice(id)
    if (id === OTHER || id === "") {
      // Model not in the list: keep the brand, the driver types the model and measurements
      setForm((f) => ({ ...empty, plateNumber: f.plateNumber, plateState: f.plateState, color: f.color, year: f.year, make: id === OTHER ? make : "" }))
      return
    }
    const m = catalog.find((x) => x.id === id)
    if (!m) return
    setForm((f) => ({
      ...f,
      vehicleModelId: m.id,
      make: m.make,
      model: m.variant ? `${m.model} (${m.variant})` : m.model,
      category: m.category,
      seats: String(m.seats),
      cargoLengthIn: String(m.cargoLengthIn),
      cargoWidthIn: String(m.cargoWidthIn),
      cargoHeightIn: m.cargoHeightIn == null ? "" : String(m.cargoHeightIn),
      openTop: m.openTop,
      payloadLbs: String(m.payloadLbs),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setForm(empty)
      setMake("")
      setModelChoice("")
      router.refresh()
    } else {
      setError(errorMessage((await res.json().catch(() => ({}))).error))
    }
    setSaving(false)
  }

  const showDetails = fromCatalog || manual

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>{t("make")}</Label>
          <Select
            value={make}
            onChange={(e) => {
              setMake(e.target.value)
              setModelChoice("")
              setForm({ ...empty, make: e.target.value === OTHER ? "" : e.target.value })
            }}
          >
            <option value="">{t("pickModel")}</option>
            {makes.map((m) => <option key={m} value={m}>{m}</option>)}
            <option value={OTHER}>{t("other")}</option>
          </Select>
        </div>
        {make && make !== OTHER && (
          <div className="space-y-1">
            <Label>{t("model")}</Label>
            <Select value={modelChoice} onChange={(e) => pickModel(e.target.value)}>
              <option value="">—</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>{m.model}{m.variant ? ` – ${m.variant}` : ""}</option>
              ))}
              <option value={OTHER}>{t("otherModel")}</option>
            </Select>
          </div>
        )}
      </div>

      {showDetails && (
        <>
          {manual && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1"><Label>{t("make")}</Label><Input value={form.make} onChange={(e) => set("make", e.target.value)} readOnly={make !== OTHER} required /></div>
              <div className="space-y-1"><Label>{t("model")}</Label><Input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder={t("modelPlaceholder")} required /></div>
              <div className="space-y-1">
                <Label>{t("category")}</Label>
                <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{t(`cat_${c}`)}</option>)}
                </Select>
              </div>
            </div>
          )}
          {fromCatalog && <p className="rounded-md bg-amber-50 p-2 text-sm text-amber-800">{t("approx")}</p>}
          {manual && <p className="rounded-md bg-amber-50 p-2 text-sm text-amber-800">{t("manualHelp")}</p>}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>{t("plate")}</Label>
              <Input value={form.plateNumber} onChange={(e) => set("plateNumber", e.target.value.toUpperCase())} maxLength={10} placeholder="ABC 123" required />
            </div>
            <div className="space-y-1"><Label>{t("plateState")}</Label><StateSelect value={form.plateState} onChange={(v) => set("plateState", v)} /></div>
            <div className="space-y-1"><Label>{t("color")}</Label><Input value={form.color} onChange={(e) => set("color", e.target.value)} maxLength={30} /></div>
          </div>
          <p className="-mt-2 text-xs text-gray-500">{t("plateHelp")}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1"><Label>{t("year")}</Label><Input type="number" value={form.year} onChange={(e) => set("year", e.target.value)} /></div>
            <div className="space-y-1">
              <Label>{t("seats")}</Label>
              <Input type="number" min={0} value={form.seats} onChange={(e) => set("seats", e.target.value)} required />
              <p className="text-xs text-gray-500">{t("seatsHelp")}</p>
            </div>
            <div className="space-y-1">
              <Label>{t("coldChain")}</Label>
              <Select value={form.coldChain} onChange={(e) => set("coldChain", e.target.value)}>
                {COLD.map((c) => <option key={c} value={c}>{t(`cold_${c}`)}</option>)}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("cargoTitle")}</p>
            <p className="text-xs text-gray-500">{t("cargoHelp")}</p>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1"><Label>{t("length")}</Label><Input type="number" step="0.1" value={form.cargoLengthIn} onChange={(e) => set("cargoLengthIn", e.target.value)} required /></div>
              <div className="space-y-1"><Label>{t("width")}</Label><Input type="number" step="0.1" value={form.cargoWidthIn} onChange={(e) => set("cargoWidthIn", e.target.value)} required /></div>
              <div className="space-y-1"><Label>{t("height")}</Label><Input type="number" step="0.1" value={form.cargoHeightIn} onChange={(e) => set("cargoHeightIn", e.target.value)} disabled={form.openTop} required={!form.openTop} /></div>
              <div className="space-y-1"><Label>{t("payload")}</Label><Input type="number" value={form.payloadLbs} onChange={(e) => set("payloadLbs", e.target.value)} required /></div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.openTop} onChange={(e) => set("openTop", e.target.checked)} />
              {t("openTop")}
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>{saving ? t("saving") : t("save")}</Button>
        </>
      )}
    </form>
  )
}

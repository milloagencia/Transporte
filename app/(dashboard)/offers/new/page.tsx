"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StateSelect, localToIso, nowLocalInput, useErrorMessage } from "@/components/form-helpers"
import { inchesLabel } from "@/lib/matching"

type Vehicle = {
  id: string; make: string; model: string; year: number | null; seats: number; payloadLbs: number
  cargoLengthIn: number; cargoWidthIn: number; cargoHeightIn: number | null; openTop: boolean
}

export default function NewOfferPage() {
  const t = useTranslations("trip")
  const router = useRouter()
  const errorMessage = useErrorMessage()
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    vehicleId: "", originCity: "", originState: "NE", destCity: "", destState: "NE",
    startWindowFrom: "", startWindowTo: "", serviceType: "people", exclusivity: "either",
    seats: "", cargoWeightLbs: "", proposedRate: "", anyDestination: "no", maxTripMiles: "",
  })
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch("/api/vehicles").then((r) => (r.ok ? r.json() : [])).then((list: Vehicle[]) => {
      setVehicles(list)
      if (list[0]) setForm((f) => ({ ...f, vehicleId: list[0].id, seats: String(list[0].seats), cargoWeightLbs: String(list[0].payloadLbs) }))
    })
  }, [])

  const vehicle = vehicles?.find((v) => v.id === form.vehicleId)
  const anyDest = form.anyDestination === "yes"
  const people = form.serviceType !== "cargo"
  // Picking the start time fills "until" with one hour later, so a simple 10:00–11:00 slot is one click
  const setFrom = (v: string) => setForm((f) => {
    let to = f.startWindowTo
    if (v && (!to || to <= v)) {
      const d = new Date(v); d.setHours(d.getHours() + 1)
      to = new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
    }
    return { ...f, startWindowFrom: v, startWindowTo: to }
  })
  const cargo = form.serviceType !== "people"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        anyDestination: form.anyDestination === "yes",
        startWindowFrom: localToIso(form.startWindowFrom),
        startWindowTo: localToIso(form.startWindowTo),
      }),
    })
    if (res.ok) {
      const d = await res.json()
      router.push(`/offers/${d.id}`)
    } else {
      setError(errorMessage((await res.json().catch(() => ({}))).error))
      setLoading(false)
    }
  }

  if (vehicles && vehicles.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader><CardTitle>{t("newOffer")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600">{t("noVehicles")}</p>
            <Link href="/vehicles"><Button>{t("vehicle")} →</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader><CardTitle>{t("newOffer")}</CardTitle></CardHeader>
        <CardContent>
          <p className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-900">{t("offerIntro")}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label>{t("vehicle")}</Label>
              <Select
                value={form.vehicleId}
                onChange={(e) => {
                  const v = vehicles?.find((x) => x.id === e.target.value)
                  setForm((f) => ({ ...f, vehicleId: e.target.value, seats: v ? String(v.seats) : "", cargoWeightLbs: v ? String(v.payloadLbs) : "" }))
                }}
                required
              >
                {(vehicles ?? []).map((v) => (
                  <option key={v.id} value={v.id}>{v.make} {v.model}{v.year ? ` · ${v.year}` : ""}</option>
                ))}
              </Select>
              {vehicle && (
                <p className="text-xs text-gray-500">
                  {t("seats")}: {vehicle.seats} · {t("space")}: {inchesLabel(vehicle.cargoLengthIn, vehicle.cargoWidthIn, vehicle.cargoHeightIn)}
                  {vehicle.openTop ? ` (${t("openTop")})` : ""} · {t("maxWeight")}: {Math.round(vehicle.payloadLbs)} lb
                </p>
              )}
            </div>
            <fieldset className="space-y-3 rounded-lg border border-gray-200 p-3">
              <legend className="px-1 text-sm font-semibold">{t("whereWhen")}</legend>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1"><Label>{t("availableCity")}</Label><Input value={form.originCity} onChange={(e) => set("originCity", e.target.value)} placeholder="Omaha" minLength={2} maxLength={80} required /></div>
                <div className="space-y-1"><Label>{t("state")}</Label><StateSelect value={form.originState} onChange={(v) => set("originState", v)} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label>{t("availableFrom")}</Label><Input type="datetime-local" min={nowLocalInput()} value={form.startWindowFrom} onChange={(e) => setFrom(e.target.value)} required /></div>
                <div className="space-y-1"><Label>{t("availableTo")}</Label><Input type="datetime-local" min={form.startWindowFrom || nowLocalInput()} value={form.startWindowTo} onChange={(e) => set("startWindowTo", e.target.value)} required /></div>
              </div>
              <p className="text-xs text-gray-500">{t("windowHelp")}</p>
            </fieldset>
            <fieldset className="space-y-3 rounded-lg border border-gray-200 p-3">
              <legend className="px-1 text-sm font-semibold">{t("whereTo")}</legend>
              <label className="flex items-start gap-2 text-sm">
                <input type="radio" name="anyDest" className="mt-1" checked={!anyDest} onChange={() => set("anyDestination", "no")} />
                <span>{t("destSpecific")}</span>
              </label>
              {!anyDest && (
                <div className="grid grid-cols-3 gap-3 pl-6">
                  <div className="col-span-2 space-y-1"><Label>{t("destination")}</Label><Input value={form.destCity} onChange={(e) => set("destCity", e.target.value)} placeholder="Lincoln" minLength={2} maxLength={80} required /></div>
                  <div className="space-y-1"><Label>{t("state")}</Label><StateSelect value={form.destState} onChange={(v) => set("destState", v)} /></div>
                </div>
              )}
              <label className="flex items-start gap-2 text-sm">
                <input type="radio" name="anyDest" className="mt-1" checked={anyDest} onChange={() => set("anyDestination", "yes")} />
                <span>{t("destAny")}</span>
              </label>
              {anyDest && (
                <div className="space-y-1 pl-6">
                  <Label>{t("maxTripMiles")}</Label>
                  <Input type="number" min={5} max={2000} value={form.maxTripMiles} onChange={(e) => set("maxTripMiles", e.target.value)} placeholder="150" />
                  <p className="text-xs text-gray-500">{t("maxTripMilesHelp")}</p>
                </div>
              )}
            </fieldset>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{t("service")}</Label>
                <Select value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)}>
                  <option value="people">{t("people")}</option>
                  <option value="cargo">{t("cargo")}</option>
                  <option value="mixed">{t("mixed")}</option>
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
            <div className="grid grid-cols-2 gap-3">
              {people && (
                <div className="space-y-1">
                  <Label>{t("seatsOffered")}</Label>
                  <Input type="number" min={1} max={vehicle?.seats} value={form.seats} onChange={(e) => set("seats", e.target.value)} required />
                </div>
              )}
              {cargo && (
                <div className="space-y-1">
                  <Label>{t("weightOffered")}</Label>
                  <Input type="number" min={1} max={vehicle?.payloadLbs} value={form.cargoWeightLbs} onChange={(e) => set("cargoWeightLbs", e.target.value)} required />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Label>{anyDest ? t("ratePerMile") : t("rateTrip")}</Label>
              <Input type="number" step="0.01" min={anyDest ? "0.1" : "1"} max={anyDest ? "50" : "100000"} value={form.proposedRate} onChange={(e) => set("proposedRate", e.target.value)} placeholder={anyDest ? "1.50" : "40"} required />
              <p className="text-xs text-gray-500">{anyDest ? t("ratePerMileHelp") : t("rateTripHelp")}</p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !vehicles}>{loading ? t("posting") : t("postOffer")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

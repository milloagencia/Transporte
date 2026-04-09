"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    originCity: "", originState: "NE", destCity: "", destState: "NE",
    windowFrom: "", windowTo: "", serviceType: "people", exclusivity: "either",
    passengerCount: "", budgetProposed: "",
  })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        passengerCount: form.passengerCount ? parseInt(form.passengerCount) : undefined,
        budgetProposed: form.budgetProposed ? parseFloat(form.budgetProposed) : undefined,
      }),
    })
    if (res.ok) {
      const d = await res.json()
      router.push(`/requests/${d.id}`)
    } else {
      alert("Error")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>Post a Trip Request</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1"><Label>Origin City</Label><Input value={form.originCity} onChange={(e) => set("originCity", e.target.value)} required /></div>
              <div className="space-y-1"><Label>State</Label><Input value={form.originState} onChange={(e) => set("originState", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1"><Label>Destination City</Label><Input value={form.destCity} onChange={(e) => set("destCity", e.target.value)} required /></div>
              <div className="space-y-1"><Label>State</Label><Input value={form.destState} onChange={(e) => set("destState", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Window From</Label><Input type="datetime-local" value={form.windowFrom} onChange={(e) => set("windowFrom", e.target.value)} required /></div>
              <div className="space-y-1"><Label>Window To</Label><Input type="datetime-local" value={form.windowTo} onChange={(e) => set("windowTo", e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Service</Label>
                <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)}>
                  <option value="people">People</option>
                  <option value="cargo">Cargo</option>
                </select>
              </div>
              <div className="space-y-1"><Label>Passengers</Label><Input type="number" value={form.passengerCount} onChange={(e) => set("passengerCount", e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label>Budget ($, optional)</Label><Input type="number" step="0.01" value={form.budgetProposed} onChange={(e) => set("budgetProposed", e.target.value)} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Posting..." : "Post Request"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

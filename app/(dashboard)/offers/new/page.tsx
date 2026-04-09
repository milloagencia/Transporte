"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewOfferPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    originCity: "", originState: "NE", destCity: "", destState: "NE",
    startWindowFrom: "", startWindowTo: "",
    serviceType: "people", exclusivity: "either",
    seats: "", proposedRate: "",
  })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        seats: form.seats ? parseInt(form.seats) : undefined,
        proposedRate: parseFloat(form.proposedRate),
      }),
    })
    if (res.ok) {
      const d = await res.json()
      router.push(`/offers/${d.id}`)
    } else {
      alert("Error creating offer")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>Post a Trip Offer</CardTitle></CardHeader>
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
              <div className="space-y-1"><Label>Window From</Label><Input type="datetime-local" value={form.startWindowFrom} onChange={(e) => set("startWindowFrom", e.target.value)} required /></div>
              <div className="space-y-1"><Label>Window To</Label><Input type="datetime-local" value={form.startWindowTo} onChange={(e) => set("startWindowTo", e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Service</Label>
                <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={form.serviceType} onChange={(e) => set("serviceType", e.target.value)}>
                  <option value="people">People</option>
                  <option value="cargo">Cargo</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Exclusivity</Label>
                <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={form.exclusivity} onChange={(e) => set("exclusivity", e.target.value)}>
                  <option value="exclusive">Exclusive</option>
                  <option value="shared">Shared</option>
                  <option value="either">Either</option>
                </select>
              </div>
              <div className="space-y-1"><Label>Seats</Label><Input type="number" value={form.seats} onChange={(e) => set("seats", e.target.value)} /></div>
            </div>
            <div className="space-y-1"><Label>Rate ($)</Label><Input type="number" step="0.01" value={form.proposedRate} onChange={(e) => set("proposedRate", e.target.value)} required /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Posting..." : "Post Offer"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

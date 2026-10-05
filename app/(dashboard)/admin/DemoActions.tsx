"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DemoActions() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function run(method: "POST" | "DELETE") {
    setBusy(true)
    await fetch("/api/admin/demo", { method })
    setBusy(false)
    router.refresh()
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" disabled={busy} onClick={() => run("POST")}>Recrear datos demo (fechas nuevas)</Button>
      <Button size="sm" variant="destructive" disabled={busy} onClick={() => run("DELETE")}>Borrar datos demo</Button>
    </div>
  )
}

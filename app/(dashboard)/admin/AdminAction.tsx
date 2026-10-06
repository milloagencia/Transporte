"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useErrorMessage } from "@/components/form-helpers"
import { cn } from "@/lib/utils"

/**
 * Small admin button. Destructive actions ask for confirmation (and optionally a reason)
 * inline, without browser pop-ups.
 */
export default function AdminAction({
  url, method = "PATCH", body = {}, label, tone = "default", confirm = false, reason = false,
}: {
  url: string
  method?: "PATCH" | "DELETE" | "POST"
  body?: Record<string, unknown>
  label: string
  tone?: "default" | "danger" | "success" | "warning"
  confirm?: boolean
  reason?: boolean
}) {
  const router = useRouter()
  const errorMessage = useErrorMessage()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function run() {
    setBusy(true)
    setError("")
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "DELETE" ? undefined : JSON.stringify({ ...body, reason: text || undefined }),
    })
    setBusy(false)
    if (!res.ok) return setError(errorMessage((await res.json().catch(() => ({}))).error))
    setOpen(false)
    setText("")
    router.refresh()
  }

  const cls = cn(
    "rounded px-2 py-1 text-xs font-medium border whitespace-nowrap disabled:opacity-50",
    tone === "danger" && "border-red-300 text-red-700 hover:bg-red-50",
    tone === "success" && "border-emerald-300 text-emerald-700 hover:bg-emerald-50",
    tone === "warning" && "border-amber-300 text-amber-800 hover:bg-amber-50",
    tone === "default" && "border-slate-300 text-slate-700 hover:bg-slate-50",
  )

  if (!confirm && !reason) {
    return (
      <span className="inline-flex flex-col">
        <button type="button" className={cls} disabled={busy} onClick={run}>{label}</button>
        {error && <span className="text-[11px] text-red-600">{error}</span>}
      </span>
    )
  }
  return (
    <span className="inline-flex flex-col gap-1">
      {!open ? (
        <button type="button" className={cls} onClick={() => setOpen(true)}>{label}</button>
      ) : (
        <span className="inline-flex flex-wrap items-center gap-1" data-admin-busy>
          {reason && <input className="h-7 w-40 rounded border border-slate-300 px-1 text-xs" placeholder="Motivo" value={text} onChange={(e) => setText(e.target.value)} />}
          <button type="button" className={cn(cls, "bg-white")} disabled={busy} onClick={run}>✓ {label}</button>
          <button type="button" className="text-xs text-slate-500 hover:underline" onClick={() => setOpen(false)}>✕</button>
        </span>
      )}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </span>
  )
}

"use client"
import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useErrorMessage } from "@/components/form-helpers"

/** Creates a saved-search email alert. */
export default function AlertButton({ payload, label, className }: { payload: () => Record<string, unknown>; label: string; className?: string }) {
  const t = useTranslations("alerts")
  const errorMessage = useErrorMessage()
  const [state, setState] = useState<"idle" | "saving" | "done">("idle")
  const [error, setError] = useState("")

  async function create() {
    setState("saving")
    setError("")
    const res = await fetch("/api/alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) })
    if (res.ok) setState("done")
    else {
      setState("idle")
      setError(errorMessage((await res.json().catch(() => ({}))).error))
    }
  }

  if (state === "done") {
    return (
      <span className="text-sm text-emerald-700">
        ✓ {t("created")} <Link href="/alerts" className="underline">{t("manage")}</Link>
      </span>
    )
  }
  return (
    <span className="inline-flex flex-col">
      <button type="button" onClick={create} disabled={state === "saving"} className={className ?? "h-9 rounded-md border border-blue-300 bg-blue-50 px-3 text-sm font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-50"}>
        🔔 {label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  )
}

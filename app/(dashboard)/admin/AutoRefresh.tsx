"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Refreshes the admin screen every 30 s. It pauses while you are typing or confirming
 * an action (any focused field, or an open admin confirmation), and while the tab is hidden.
 */
export default function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter()
  const [last, setLast] = useState(() => Date.now())
  const [paused, setPaused] = useState(false)
  const [ago, setAgo] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement
      const busy = typing || document.querySelector("[data-admin-busy]") !== null || document.visibilityState !== "visible"
      setPaused(busy)
      setAgo(Math.round((Date.now() - last) / 1000))
      if (!busy && Date.now() - last >= seconds * 1000) {
        router.refresh()
        setLast(Date.now())
        setAgo(0)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [router, last, seconds])

  return (
    <span className="text-xs text-slate-500">
      {paused ? "⏸ Actualización en pausa mientras escribes" : `⟳ Actualizado hace ${ago}s · cada ${seconds}s`}
    </span>
  )
}

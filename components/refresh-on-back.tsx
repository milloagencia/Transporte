"use client"
import { useEffect } from "react"

/**
 * When the browser restores a page from its back/forward cache it shows an old snapshot
 * (for example the sign-in page from before the user logged in). Reload so the server
 * shows the real, current state of the session.
 */
export default function RefreshOnBack() {
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) window.location.reload() }
    window.addEventListener("pageshow", onShow)
    return () => window.removeEventListener("pageshow", onShow)
  }, [])
  return null
}

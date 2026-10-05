"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

const cls = "whitespace-nowrap rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700"

/** Public pages are cached/static: ask the server whether the visitor is signed in and show "My panel" instead of "Sign in". */
export default function AccountLink({ lang, signInLabel }: { lang: "es" | "en"; signInLabel: string }) {
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => {
    const check = () => fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json()).then((s) => setSignedIn(Boolean(s?.user))).catch(() => {})
    check()
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) check() }
    window.addEventListener("pageshow", onShow)
    return () => window.removeEventListener("pageshow", onShow)
  }, [])
  return signedIn
    ? <Link href="/dashboard" className={cls}>{lang === "es" ? "Mi panel" : "My panel"}</Link>
    : <Link href={`/auth/signin?lang=${lang}`} className={cls}>{signInLabel}</Link>
}

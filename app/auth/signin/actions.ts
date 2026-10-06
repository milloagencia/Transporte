"use server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { signIn } from "@/auth"
import { rateLimited } from "@/lib/rate-limit"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Sends the magic link from the server, so it works even before the page's JavaScript loads. */
export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254)
  const as = formData.get("as") === "driver" ? "driver" : formData.get("as") === "shipper" ? "shipper" : null
  if (!EMAIL_RE.test(email)) redirect("/auth/signin?error=missing")

  // Anti-spam: max 3 links per email and 10 per IP every 15 minutes
  const h = await headers()
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown").split(",")[0].trim()
  const WINDOW = 15 * 60 * 1000
  if (rateLimited(`email:${email}`, 3, WINDOW) || rateLimited(`ip:${ip}`, 10, WINDOW)) {
    redirect("/auth/signin?error=rate")
  }

  try {
    await signIn("email", { email, redirectTo: as ? `/onboarding?as=${as}` : "/dashboard", redirect: false })
  } catch (e) {
    console.error("[auth] magic link failed", e)
    redirect("/auth/signin?error=send")
  }
  redirect("/auth/verify")
}

import type { Metadata } from "next"
import Landing from "@/components/public/landing"
import { LANDING } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({ lang: "en", title: LANDING.en.title, description: LANDING.en.description, path: "/", altPath: "/es" })

export default function HomePage() {
  return <Landing lang="en" />
}

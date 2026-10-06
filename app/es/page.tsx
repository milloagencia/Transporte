import type { Metadata } from "next"
import Landing from "@/components/public/landing"
import { LANDING } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({ lang: "es", title: LANDING.es.title, description: LANDING.es.description, path: "/es", altPath: "/" })

export default function HomePageEs() {
  return <Landing lang="es" />
}

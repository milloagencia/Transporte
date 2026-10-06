import type { Metadata } from "next"
import CityPage, { cityDescription, cityTitle } from "@/components/public/city-page"
import { CITIES, paths } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

const LANG = "en" as const
const OTHER = "es" as const

export const dynamicParams = false
export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  const c = CITIES.find((x) => x.slug === city)
  if (!c) return {}
  const routes = c.routes.slice(0, 3).map((r) => r.to).join(", ")
  return pageMeta({ lang: LANG, title: cityTitle(LANG, c.name), description: cityDescription(LANG, c.name, routes), path: paths.city(LANG, c.slug), altPath: paths.city(OTHER, c.slug) })
}

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  return <CityPage lang={LANG} slug={city} />
}

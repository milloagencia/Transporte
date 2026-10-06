import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ServicePage from "@/components/public/service-page"
import { BRAND, SERVICES, paths, type ServiceKey } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

const LANG = "en" as const
const OTHER = "es" as const
const keyFor = (slug: string) => (Object.keys(SERVICES) as ServiceKey[]).find((k) => SERVICES[k].slug[LANG] === slug)

export const dynamicParams = false
export function generateStaticParams() {
  return (Object.keys(SERVICES) as ServiceKey[]).map((k) => ({ service: SERVICES[k].slug[LANG] }))
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const key = keyFor((await params).service)
  if (!key) return {}
  const s = SERVICES[key]
  return pageMeta({ lang: LANG, title: `${s.title[LANG]} | ${BRAND}`, description: s.description[LANG], path: paths.service(LANG, key), altPath: paths.service(OTHER, key) })
}

export default async function Page({ params }: { params: Promise<{ service: string }> }) {
  const key = keyFor((await params).service)
  if (!key) notFound()
  return <ServicePage lang={LANG} service={key} />
}

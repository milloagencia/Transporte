import type { Metadata } from "next"
import { PricingPage } from "@/components/public/info-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "es",
  title: 'Calculadora de precios: viajes y carga en Nebraska | Collage Transport',
  description: '¿Cuánto cuesta un viaje o un envío entre Omaha, Lincoln, Grand Island y más? Calcula tu precio antes de registrarte.',
  path: PAGES.pricing.es,
  altPath: PAGES.pricing.en,
})

export default function Page() {
  return <PricingPage lang="es" />
}

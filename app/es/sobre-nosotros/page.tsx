import type { Metadata } from "next"
import { AboutPage } from "@/components/public/legal-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "es",
  title: 'Quiénes somos | Collage Transport',
  description: 'Collage Transport conecta a personas y negocios de Nebraska con conductores que ya hacen el viaje. Conductores verificados, bilingüe y precios que tú negocias.',
  path: PAGES.about.es,
  altPath: PAGES.about.en,
})

export default function Page() {
  return <AboutPage lang="es" />
}

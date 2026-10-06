import type { Metadata } from "next"
import { TermsPage } from "@/components/public/legal-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "es",
  title: 'Términos de uso | Collage Transport',
  description: 'Términos de uso del mercado de viajes y carga Collage Transport en Nebraska.',
  path: PAGES.terms.es,
  altPath: PAGES.terms.en,
})

export default function Page() {
  return <TermsPage lang="es" />
}

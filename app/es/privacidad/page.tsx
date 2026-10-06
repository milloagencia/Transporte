import type { Metadata } from "next"
import { PrivacyPage } from "@/components/public/legal-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "es",
  title: 'Política de privacidad | Collage Transport',
  description: 'Qué datos recoge Collage Transport, cómo se usan y cuáles son tus derechos.',
  path: PAGES.privacy.es,
  altPath: PAGES.privacy.en,
})

export default function Page() {
  return <PrivacyPage lang="es" />
}

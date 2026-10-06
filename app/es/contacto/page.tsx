import type { Metadata } from "next"
import { ContactPage } from "@/components/public/info-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "es",
  title: 'Contacto | Collage Transport',
  description: 'Preguntas, ser conductor o trabajar con nosotros como empresa. Contacta a Collage Transport en español o inglés.',
  path: PAGES.contact.es,
  altPath: PAGES.contact.en,
})

export default function Page() {
  return <ContactPage lang="es" />
}

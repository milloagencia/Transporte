import type { Metadata } from "next"
import { ServicesIndexPage } from "@/components/public/info-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "es",
  title: 'Servicios: viajes, carga y mudanzas en Nebraska | Collage Transport',
  description: 'Viajes compartidos, envío de carga y ayuda con mudanzas entre ciudades de Nebraska.',
  path: PAGES.services.es,
  altPath: PAGES.services.en,
})

export default function Page() {
  return <ServicesIndexPage lang="es" />
}

import type { Metadata } from "next"
import { AboutPage } from "@/components/public/legal-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "en",
  title: 'About us | Collage Transport',
  description: 'Collage Transport connects people and businesses in Nebraska with drivers already making the trip. Verified drivers, bilingual, prices you negotiate.',
  path: PAGES.about.en,
  altPath: PAGES.about.es,
})

export default function Page() {
  return <AboutPage lang="en" />
}

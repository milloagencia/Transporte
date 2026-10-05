import type { Metadata } from "next"
import { ServicesIndexPage } from "@/components/public/info-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "en",
  title: 'Services: rides, cargo and moving help in Nebraska | Collage Transport',
  description: 'Shared rides, cargo delivery and moving help between Nebraska cities.',
  path: PAGES.services.en,
  altPath: PAGES.services.es,
})

export default function Page() {
  return <ServicesIndexPage lang="en" />
}

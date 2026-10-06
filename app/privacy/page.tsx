import type { Metadata } from "next"
import { PrivacyPage } from "@/components/public/legal-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "en",
  title: 'Privacy policy | Collage Transport',
  description: "What data Collage Transport collects, how it's used and your rights.",
  path: PAGES.privacy.en,
  altPath: PAGES.privacy.es,
})

export default function Page() {
  return <PrivacyPage lang="en" />
}

import type { Metadata } from "next"
import { TermsPage } from "@/components/public/legal-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "en",
  title: 'Terms of use | Collage Transport',
  description: 'Terms of use of the Collage Transport marketplace for rides and cargo in Nebraska.',
  path: PAGES.terms.en,
  altPath: PAGES.terms.es,
})

export default function Page() {
  return <TermsPage lang="en" />
}

import type { Metadata } from "next"
import { ContactPage } from "@/components/public/info-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "en",
  title: 'Contact | Collage Transport',
  description: 'Questions, become a driver or partner as a business. Contact Collage Transport in English or Spanish.',
  path: PAGES.contact.en,
  altPath: PAGES.contact.es,
})

export default function Page() {
  return <ContactPage lang="en" />
}

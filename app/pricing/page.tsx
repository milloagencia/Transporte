import type { Metadata } from "next"
import { PricingPage } from "@/components/public/info-pages"
import { PAGES } from "@/lib/seo-content"
import { pageMeta } from "@/lib/seo-meta"

export const metadata: Metadata = pageMeta({
  lang: "en",
  title: 'Price estimator: rides and cargo in Nebraska | Collage Transport',
  description: 'How much does a ride or a delivery cost between Omaha, Lincoln, Grand Island and more? Estimate your price before signing up.',
  path: PAGES.pricing.en,
  altPath: PAGES.pricing.es,
})

export default function Page() {
  return <PricingPage lang="en" />
}

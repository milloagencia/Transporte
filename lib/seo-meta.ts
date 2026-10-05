import type { Metadata } from "next"
import { BRAND, SITE_URL, type Lang } from "@/lib/seo-content"

/** Metadata for a public page that exists in both languages. */
export function pageMeta(opts: { lang: Lang; title: string; description: string; path: string; altPath: string }): Metadata {
  const { lang, title, description, path, altPath } = opts
  const en = lang === "en" ? path : altPath
  const es = lang === "es" ? path : altPath
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: path,
      languages: { "en-US": en, "es-US": es, "x-default": en },
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}${path}`,
      siteName: BRAND,
      title,
      description,
      locale: lang === "es" ? "es_US" : "en_US",
      alternateLocale: lang === "es" ? "en_US" : "es_US",
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

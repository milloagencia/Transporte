import type { MetadataRoute } from "next"
import { CITIES, PAGES, SERVICES, SITE_URL, paths, type PageKey, type ServiceKey } from "@/lib/seo-content"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const pair = (en: string, es: string, priority: number): MetadataRoute.Sitemap =>
    [en, es].map((p) => ({
      url: `${SITE_URL}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
      alternates: { languages: { "en-US": `${SITE_URL}${en}`, "es-US": `${SITE_URL}${es}` } },
    }))
  return [
    ...pair("/", "/es", 1),
    ...(Object.keys(SERVICES) as ServiceKey[]).flatMap((k) => pair(paths.service("en", k), paths.service("es", k), 0.8)),
    ...CITIES.flatMap((c) => pair(paths.city("en", c.slug), paths.city("es", c.slug), 0.7)),
    ...(["pricing", "services"] as PageKey[]).flatMap((k) => pair(PAGES[k].en, PAGES[k].es, 0.8)),
    ...(["about", "contact"] as PageKey[]).flatMap((k) => pair(PAGES[k].en, PAGES[k].es, 0.5)),
    ...(["terms", "privacy"] as PageKey[]).flatMap((k) => pair(PAGES[k].en, PAGES[k].es, 0.3)),
  ]
}

import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo-content"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/es", "/nebraska/", "/es/nebraska/", "/services/", "/es/servicios/"],
      disallow: ["/api/", "/auth/", "/dashboard", "/offers", "/requests", "/deals", "/profile", "/admin", "/vehicles", "/users", "/alerts", "/onboarding"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}

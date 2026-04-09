import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"

const SUPPORTED_LOCALES = ["en", "es"] as const
type Locale = (typeof SUPPORTED_LOCALES)[number]

function parseAcceptLanguage(header: string | null): Locale {
  if (!header) return "en"
  const primary = header.split(",")[0].split("-")[0].trim().toLowerCase()
  return (SUPPORTED_LOCALES as readonly string[]).includes(primary)
    ? (primary as Locale)
    : "en"
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value
  const headerStore = await headers()
  const locale: Locale =
    cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)
      ? (cookieLocale as Locale)
      : parseAcceptLanguage(headerStore.get("Accept-Language"))
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})

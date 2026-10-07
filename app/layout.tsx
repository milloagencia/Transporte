import type { Metadata } from "next"
import "./globals.css"
import "mapbox-gl/dist/mapbox-gl.css"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

import { SITE_URL } from "@/lib/seo-content"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Collage Transport", template: "%s | Collage Transport" },
  description: "Rides and cargo between Nebraska cities. Viajes y envíos de carga entre ciudades de Nebraska.",
  applicationName: "Collage Transport",
  // Set GOOGLE_SITE_VERIFICATION / BING_SITE_VERIFICATION in Hostinger to verify the site in Search Console / Bing
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

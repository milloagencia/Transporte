import Link from "next/link"
import type { Metadata } from "next"
import { getLocale } from "next-intl/server"
import SiteShell from "@/components/public/site-shell"
import { PAGES, paths, type Lang } from "@/lib/seo-content"

export const metadata: Metadata = { title: "404", robots: { index: false } }

const T = {
  es: {
    title: "No encontramos esa página",
    body: "Puede que el enlace esté mal escrito o que la página ya no exista. Estas opciones te pueden ayudar:",
    home: "Ir al inicio",
    signIn: "Iniciar sesión",
    links: [["Servicios", PAGES.services.es], ["Precios", PAGES.pricing.es], ["Contacto", PAGES.contact.es]],
  },
  en: {
    title: "We couldn't find that page",
    body: "The link may be mistyped or the page may no longer exist. These might help:",
    home: "Go to the home page",
    signIn: "Sign in",
    links: [["Services", PAGES.services.en], ["Pricing", PAGES.pricing.en], ["Contact", PAGES.contact.en]],
  },
} as const

export default async function NotFound() {
  const lang: Lang = (await getLocale()) === "es" ? "es" : "en"
  const t = T[lang]
  return (
    <SiteShell lang={lang} altHref={paths.home(lang === "es" ? "en" : "es")}>
      <section className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-6xl font-bold text-blue-600">404</p>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{t.title}</h1>
        <p className="mt-3 text-gray-600">{t.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={paths.home(lang)} className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">{t.home}</Link>
          <Link href={`/auth/signin?lang=${lang}`} className="rounded-md border border-gray-300 px-6 py-3 font-medium hover:bg-gray-50">{t.signIn}</Link>
        </div>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          {t.links.map(([label, href]) => (
            <li key={href}><Link href={href} className="text-blue-600 hover:underline">{label}</Link></li>
          ))}
        </ul>
      </section>
    </SiteShell>
  )
}

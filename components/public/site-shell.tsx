import Link from "next/link"
import { CITIES, PAGES, SERVICES, UI, paths, type Lang, type ServiceKey } from "@/lib/seo-content"

/** Header + footer for public (indexable) pages. `altHref` is the same page in the other language. */
export default function SiteShell({ lang, altHref, children }: { lang: Lang; altHref: string; children: React.ReactNode }) {
  const ui = UI[lang]
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href={paths.home(lang)} className="whitespace-nowrap text-base font-bold text-blue-600 sm:text-lg">Collage Transport</Link>
          <nav className="flex items-center gap-3 text-sm sm:gap-4">
            <Link href={paths.service(lang, "rides")} className="hidden text-gray-600 hover:text-gray-900 sm:inline">{lang === "es" ? "Viajes compartidos" : "Rides"}</Link>
            <Link href={paths.service(lang, "cargo")} className="hidden text-gray-600 hover:text-gray-900 sm:inline">{lang === "es" ? "Envío de carga" : "Cargo"}</Link>
            <Link href={PAGES.pricing[lang]} className="hidden text-gray-600 hover:text-gray-900 min-[400px]:inline">{lang === "es" ? "Precios" : "Pricing"}</Link>
            <Link href={altHref} hrefLang={lang === "es" ? "en" : "es"} className="text-gray-600 hover:text-gray-900">{ui.other}</Link>
            <Link href={`/auth/signin?lang=${lang}`} className="whitespace-nowrap rounded-md bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700">{ui.signIn}</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
          <div>
            <p className="font-bold text-blue-600">Collage Transport</p>
            <p className="mt-2 text-sm text-gray-600">{ui.footer}</p>
          </div>
          <div>
            <p className="text-sm font-semibold"><Link href={PAGES.services[lang]} className="hover:underline">{ui.services}</Link></p>
            <ul className="mt-2 space-y-1 text-sm">
              {(Object.keys(SERVICES) as ServiceKey[]).map((k) => (
                <li key={k}><Link href={paths.service(lang, k)} className="text-gray-600 hover:text-gray-900">{SERVICES[k].title[lang]}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">{ui.cities}</p>
            <ul className="mt-2 grid grid-cols-2 gap-1 text-sm">
              {CITIES.map((c) => (
                <li key={c.slug}><Link href={paths.city(lang, c.slug)} className="text-gray-600 hover:text-gray-900">{c.name}, NE</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <nav aria-label={lang === "es" ? "Empresa y legal" : "Company and legal"} className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-5 gap-y-2 px-4 pb-4 text-sm">
          <Link href={PAGES.about[lang]} className="text-gray-600 hover:text-gray-900">{lang === "es" ? "Quiénes somos" : "About us"}</Link>
          <Link href={PAGES.contact[lang]} className="text-gray-600 hover:text-gray-900">{lang === "es" ? "Contacto" : "Contact"}</Link>
          <Link href={PAGES.pricing[lang]} className="text-gray-600 hover:text-gray-900">{lang === "es" ? "Precios" : "Pricing"}</Link>
          <Link href={PAGES.services[lang]} className="text-gray-600 hover:text-gray-900">{lang === "es" ? "Servicios" : "Services"}</Link>
          <Link href={PAGES.terms[lang]} className="text-gray-600 hover:text-gray-900">{lang === "es" ? "Términos de uso" : "Terms of use"}</Link>
          <Link href={PAGES.privacy[lang]} className="text-gray-600 hover:text-gray-900">{lang === "es" ? "Privacidad" : "Privacy"}</Link>
        </nav>
        <p className="pb-6 text-center text-xs text-gray-400">© {new Date().getFullYear()} Collage Transport · Nebraska, USA</p>
      </footer>
    </div>
  )
}

import Link from "next/link"
import { notFound } from "next/navigation"
import { BRAND, CITIES, PAGES, SERVICES, SITE_URL, UI, paths, type Lang, type ServiceKey } from "@/lib/seo-content"
import { estimate } from "@/lib/pricing"
import SiteShell from "./site-shell"
import JsonLd from "./json-ld"

export const cityTitle = (lang: Lang, name: string) =>
  lang === "es" ? `Viajes compartidos y envío de carga en ${name}, NE | ${BRAND}` : `Rides and cargo delivery in ${name}, NE | ${BRAND}`

export const cityDescription = (lang: Lang, name: string, routes: string) =>
  lang === "es"
    ? `Encuentra conductores en ${name}, Nebraska, para viajar o mandar paquetes, muebles y mercancía. Rutas a ${routes}. Precios que tú negocias.`
    : `Find drivers in ${name}, Nebraska to share a ride or send packages, furniture and goods. Routes to ${routes}. Prices you negotiate.`

export default function CityPage({ lang, slug }: { lang: Lang; slug: string }) {
  const city = CITIES.find((c) => c.slug === slug)
  if (!city) notFound()
  const ui = UI[lang]
  const other: Lang = lang === "es" ? "en" : "es"
  const nearby = CITIES.filter((c) => c.slug !== slug && city.routes.some((r) => r.to === c.name))

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: cityTitle(lang, city.name),
      serviceType: lang === "es" ? "Viajes compartidos y envío de carga" : "Ride sharing and cargo delivery",
      provider: { "@type": "Organization", name: BRAND, url: SITE_URL },
      areaServed: { "@type": "City", name: `${city.name}, NE`, containedInPlace: { "@type": "State", name: "Nebraska" } },
      availableLanguage: ["English", "Spanish"],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: ui.home, item: `${SITE_URL}${paths.home(lang)}` },
        { "@type": "ListItem", position: 2, name: `${city.name}, NE`, item: `${SITE_URL}${paths.city(lang, city.slug)}` },
      ],
    },
  ]

  return (
    <SiteShell lang={lang} altHref={paths.city(other, city.slug)}>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <nav className="text-sm text-gray-500"><Link href={paths.home(lang)} className="hover:underline">{ui.home}</Link> › {city.name}, NE</nav>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
          {lang === "es" ? `Viajes compartidos y envío de carga en ${city.name}, Nebraska` : `Rides and cargo delivery in ${city.name}, Nebraska`}
        </h1>
        <p className="mt-5 text-lg text-gray-700">{city.intro[lang]}</p>

        <h2 className="mt-10 text-2xl font-bold">{ui.popularRoutes} {city.name}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {city.routes.map((r) => (
            <li key={r.to} className="rounded-md border border-gray-200 px-4 py-3">
              <strong>{city.name} → {r.to}</strong>
              <span className="text-gray-500"> · {lang === "es" ? "aprox." : "about"} {r.miles} {ui.miles}</span>
              <span className="block text-xs text-gray-600">
                {lang === "es" ? "Asiento" : "Seat"} ${estimate("seat", r.miles)[0]}–${estimate("seat", r.miles)[1]} · {lang === "es" ? "Mueble" : "Furniture"} ${estimate("medium", r.miles)[0]}–${estimate("medium", r.miles)[1]}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-sm"><Link href={PAGES.pricing[lang]} className="text-blue-700 underline">{lang === "es" ? "Precios de referencia. Calcula el tuyo →" : "Reference prices. Estimate yours →"}</Link></p>

        <h2 className="mt-10 text-2xl font-bold">{lang === "es" ? `Qué puedes hacer en ${city.name}` : `What you can do in ${city.name}`}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {(Object.keys(SERVICES) as ServiceKey[]).map((k) => (
            <Link key={k} href={paths.service(lang, k)} className="rounded-lg border border-gray-200 p-4 hover:border-blue-400">
              <h3 className="font-semibold text-blue-700">{SERVICES[k].title[lang]}</h3>
              <p className="mt-1 text-sm text-gray-600">{SERVICES[k].description[lang]}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-lg bg-blue-50 p-6 text-center">
          <p className="text-lg font-medium">{ui.cityCta} {city.name}?</p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/auth/signin?as=shipper&lang=${lang}`} className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700">{ui.postRequest}</Link>
            <Link href={`/auth/signin?as=driver&lang=${lang}`} className="rounded-md border border-gray-300 bg-white px-5 py-2 font-medium hover:bg-gray-50">{ui.becomeDriver}</Link>
          </div>
        </div>

        {nearby.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-bold">{lang === "es" ? "Ciudades cercanas" : "Nearby cities"}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {nearby.map((c) => (
                <li key={c.slug}><Link href={paths.city(lang, c.slug)} className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:border-blue-400">{c.name}</Link></li>
              ))}
            </ul>
          </>
        )}
      </div>
    </SiteShell>
  )
}

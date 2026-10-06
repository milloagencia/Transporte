import Link from "next/link"
import { BRAND, CITIES, LANDING, PAGES, SERVICES, SITE_URL, UI, paths, type Lang, type ServiceKey } from "@/lib/seo-content"
import SiteShell from "./site-shell"
import JsonLd from "./json-ld"

export default function Landing({ lang }: { lang: Lang }) {
  const c = LANDING[lang]
  const ui = UI[lang]
  const other: Lang = lang === "es" ? "en" : "es"

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: BRAND,
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      areaServed: { "@type": "State", name: "Nebraska" },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: BRAND,
      url: SITE_URL,
      inLanguage: ["en-US", "es-US"],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      serviceType: lang === "es" ? "Viajes compartidos y envío de carga" : "Ride sharing and cargo delivery",
      provider: { "@type": "Organization", name: BRAND, url: SITE_URL },
      areaServed: CITIES.map((x) => ({ "@type": "City", name: `${x.name}, NE` })),
      availableLanguage: ["English", "Spanish"],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: lang === "es" ? "es-US" : "en-US",
      mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
  ]

  return (
    <SiteShell lang={lang} altHref={paths.home(other)}>
      <JsonLd data={jsonLd} />
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{c.h1}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">{c.lead}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/auth/signin?as=shipper&lang=${lang}`} className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">{c.ctaRequest}</Link>
            <Link href={`/auth/signin?as=driver&lang=${lang}`} className="rounded-md border border-gray-300 bg-white px-6 py-3 font-medium hover:bg-gray-50">{c.ctaDrive}</Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">{c.beta}</p>
          <p className="mt-2"><Link href={PAGES.pricing[lang]} className="text-sm font-medium text-blue-700 underline">{lang === "es" ? "¿Cuánto cuesta? Calcula tu precio sin registrarte →" : "How much does it cost? Estimate your price without signing up →"}</Link></p>
        </div>
      </section>

      <section aria-label={lang === "es" ? "Por qué confiar" : "Why trust us"} className="border-y border-gray-100 bg-white">
        <ul className="mx-auto grid max-w-6xl gap-4 px-4 py-6 text-sm sm:grid-cols-4">
          {(lang === "es"
            ? [["🪪", "Conductores verificados", "Licencia, seguro e inspección revisados"], ["🔒", "Tus datos protegidos", "Contacto y dirección solo tras confirmar"], ["⭐", "Calificaciones reales", "Comentarios revisados por personas"], ["🗣️", "Español e inglés", "Atención en tu idioma"]]
            : [["🪪", "Verified drivers", "License, insurance and inspection reviewed"], ["🔒", "Your data protected", "Contact and address only after confirming"], ["⭐", "Real ratings", "Comments reviewed by people"], ["🗣️", "English and Spanish", "Help in your language"]]
          ).map(([icon, title, text]) => (
            <li key={title} className="flex gap-3">
              <span className="text-2xl" aria-hidden="true">{icon}</span>
              <span><strong className="block">{title}</strong><span className="text-gray-600">{text}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">{c.how}</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {c.steps.map(([title, text], i) => (
            <li key={title} className="rounded-lg border border-gray-200 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">{c.servicesTitle}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {(Object.keys(SERVICES) as ServiceKey[]).map((k) => (
            <Link key={k} href={paths.service(lang, k)} className="rounded-lg border border-gray-200 p-5 hover:border-blue-400">
              <h3 className="font-semibold text-blue-700">{SERVICES[k].title[lang]}</h3>
              <p className="mt-2 text-sm text-gray-600">{SERVICES[k].description[lang]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold">{c.citiesTitle}</h2>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CITIES.map((x) => (
            <li key={x.slug}>
              <Link href={paths.city(lang, x.slug)} aria-label={`${ui.ridesIn} ${x.name}, Nebraska`} className="block rounded-md border border-gray-200 px-4 py-3 text-sm hover:border-blue-400">
                {ui.ridesIn}{" "}<strong>{x.name}</strong>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold">{c.faqTitle}</h2>
        <div className="mt-6 divide-y divide-gray-200">
          {c.faq.map(([q, a]) => (
            <details key={q} className="py-4">
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="mt-2 text-gray-600">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteShell>
  )
}

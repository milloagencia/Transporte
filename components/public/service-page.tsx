import Link from "next/link"
import { BRAND, CITIES, SERVICES, SITE_URL, UI, paths, type Lang, type ServiceKey } from "@/lib/seo-content"
import SiteShell from "./site-shell"
import JsonLd from "./json-ld"

export default function ServicePage({ lang, service }: { lang: Lang; service: ServiceKey }) {
  const s = SERVICES[service]
  const ui = UI[lang]
  const other: Lang = lang === "es" ? "en" : "es"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.title[lang],
    description: s.description[lang],
    provider: { "@type": "Organization", name: BRAND, url: SITE_URL },
    areaServed: { "@type": "State", name: "Nebraska" },
    availableLanguage: ["English", "Spanish"],
  }
  return (
    <SiteShell lang={lang} altHref={paths.service(other, service)}>
      <JsonLd data={jsonLd} />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <nav className="text-sm text-gray-500"><Link href={paths.home(lang)} className="hover:underline">{ui.home}</Link> › {s.title[lang]}</nav>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{s.h1[lang]}</h1>
        {s.body[lang].map((p) => <p key={p} className="mt-5 text-lg text-gray-700">{p}</p>)}
        <ul className="mt-6 space-y-2">
          {s.bullets[lang].map((b) => (
            <li key={b} className="flex gap-2"><span className="text-blue-600">✓</span>{b}</li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={`/auth/signin?as=shipper&lang=${lang}`} className="rounded-md bg-blue-600 px-5 py-2 text-center font-medium text-white hover:bg-blue-700">{ui.postRequest}</Link>
          <Link href={`/auth/signin?as=driver&lang=${lang}`} className="rounded-md border border-gray-300 px-5 py-2 text-center font-medium hover:bg-gray-50">{ui.becomeDriver}</Link>
        </div>
        <h2 className="mt-12 text-2xl font-bold">{ui.cities}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CITIES.map((c) => (
            <li key={c.slug}><Link href={paths.city(lang, c.slug)} className="block rounded-md border border-gray-200 px-3 py-2 text-sm hover:border-blue-400">{c.name}, NE</Link></li>
          ))}
        </ul>
      </div>
    </SiteShell>
  )
}

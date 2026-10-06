import Link from "next/link"
import { CITIES, PAGES, SERVICES, paths, type Lang, type ServiceKey } from "@/lib/seo-content"
import { estimate } from "@/lib/pricing"
import { coordsOf, roadMiles } from "@/lib/geo"
import SiteShell from "./site-shell"
import ContactForm from "./contact-form"
import PriceEstimator from "./price-estimator"

const other = (l: Lang): Lang => (l === "es" ? "en" : "es")

export function ContactPage({ lang }: { lang: Lang }) {
  const es = lang === "es"
  return (
    <SiteShell lang={lang} altHref={PAGES.contact[other(lang)]}>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold">{es ? "Contacto" : "Contact"}</h1>
        <p className="mt-3 text-gray-700">{es
          ? "¿Tienes preguntas, quieres trabajar con nosotros como conductor o empresa, o necesitas ayuda con un viaje? Escríbenos y te respondemos por correo, en español o en inglés."
          : "Questions, want to work with us as a driver or business, or need help with a trip? Write to us and we'll reply by email, in English or Spanish."}</p>
        <p className="mt-2 text-sm text-gray-500">{es ? "Atendemos desde Nebraska, EE. UU." : "We're based in Nebraska, USA."}</p>
        <div className="mt-8"><ContactForm lang={lang} /></div>
      </div>
    </SiteShell>
  )
}

/** Example prices for popular routes, computed with the same formula as the estimator. */
function examples() {
  const routes: [string, string, string, string][] = [
    ["Omaha", "NE", "Lincoln", "NE"], ["Omaha", "NE", "Grand Island", "NE"], ["Grand Island", "NE", "Kearney", "NE"],
    ["Omaha", "NE", "Des Moines", "IA"], ["Omaha", "NE", "Kansas City", "MO"], ["Norfolk", "NE", "Omaha", "NE"],
  ]
  return routes.map(([a, as, b, bs]) => {
    const miles = roadMiles(coordsOf(a, as), coordsOf(b, bs)) ?? 0
    return { route: `${a} → ${b}${bs !== "NE" ? `, ${bs}` : ""}`, miles, seat: estimate("seat", miles), medium: estimate("medium", miles), move: estimate("move", miles) }
  })
}

export function PricingPage({ lang }: { lang: Lang }) {
  const es = lang === "es"
  return (
    <SiteShell lang={lang} altHref={PAGES.pricing[other(lang)]}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold">{es ? "¿Cuánto cuesta? Calcula tu precio" : "How much does it cost? Estimate your price"}</h1>
        <p className="mt-3 text-gray-700">{es
          ? "En Collage Transport el precio lo acuerdan el cliente y el conductor. Para que tengas una idea antes de registrarte, aquí tienes un estimado según la distancia y lo que necesitas mover. Publicar una solicitud es gratis."
          : "On Collage Transport the price is agreed between customer and driver. To give you an idea before signing up, here's an estimate based on distance and what you need to move. Posting a request is free."}</p>
        <div className="mt-8"><PriceEstimator lang={lang} /></div>
        <h2 className="mt-12 text-2xl font-bold">{es ? "Precios de referencia en rutas populares" : "Reference prices on popular routes"}</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr><th className="px-3 py-2">{es ? "Ruta" : "Route"}</th><th className="px-3 py-2">{es ? "Millas aprox." : "Approx. miles"}</th><th className="px-3 py-2">{es ? "1 pasajero" : "1 passenger"}</th><th className="px-3 py-2">{es ? "Mueble (pickup)" : "Furniture (pickup)"}</th><th className="px-3 py-2">{es ? "Mudanza (camión)" : "Move (box truck)"}</th></tr>
            </thead>
            <tbody>
              {examples().map((r) => (
                <tr key={r.route} className="border-t">
                  <td className="px-3 py-2 font-medium">{r.route}</td><td className="px-3 py-2">{r.miles}</td>
                  <td className="px-3 py-2">${r.seat[0]}–${r.seat[1]}</td><td className="px-3 py-2">${r.medium[0]}–${r.medium[1]}</td><td className="px-3 py-2">${r.move[0]}–${r.move[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-gray-500">{es
          ? "Estimados orientativos para Fase de lanzamiento. Incluyen la comisión de la plataforma. El precio real depende de la fecha, si compartes el viaje y lo que acuerdes con el conductor."
          : "Reference estimates for our launch phase. They include the platform fee. The real price depends on the date, whether you share the trip and what you agree with the driver."}</p>
      </div>
    </SiteShell>
  )
}

export function ServicesIndexPage({ lang }: { lang: Lang }) {
  const es = lang === "es"
  return (
    <SiteShell lang={lang} altHref={PAGES.services[other(lang)]}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold">{es ? "Servicios" : "Services"}</h1>
        <p className="mt-3 text-gray-700">{es ? "Todo lo que puedes hacer con Collage Transport en Nebraska." : "Everything you can do with Collage Transport in Nebraska."}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {(Object.keys(SERVICES) as ServiceKey[]).map((k) => (
            <Link key={k} href={paths.service(lang, k)} className="rounded-lg border p-5 hover:border-blue-400">
              <h2 className="font-semibold text-blue-700">{SERVICES[k].title[lang]}</h2>
              <p className="mt-2 text-sm text-gray-600">{SERVICES[k].description[lang]}</p>
            </Link>
          ))}
        </div>
        <h2 className="mt-12 text-2xl font-bold">{es ? "Ciudades" : "Cities"}</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CITIES.map((c) => <li key={c.slug}><Link href={paths.city(lang, c.slug)} className="block rounded-md border px-3 py-2 text-sm hover:border-blue-400">{c.name}, NE</Link></li>)}
        </ul>
        <p className="mt-8"><Link href={PAGES.pricing[lang]} className="text-blue-700 underline">{es ? "Calcula cuánto cuesta tu viaje o envío →" : "Estimate the cost of your trip or shipment →"}</Link></p>
      </div>
    </SiteShell>
  )
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Edge middleware cannot use Prisma, so here we only check that a session cookie exists.
// Every page and API route still validates the session on the server with auth().
const PROTECTED = ["/dashboard", "/offers", "/requests", "/deals", "/profile", "/admin", "/vehicles", "/users", "/alerts", "/onboarding"]
const PUBLIC_EN = ["/", "/nebraska", "/services", "/about", "/contact", "/terms", "/privacy", "/pricing"]

const startsWith = (path: string, prefix: string) => path === prefix || path.startsWith(prefix + "/")

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // API writes must come from our own site (Auth.js routes have their own CSRF protection)
  if (path.startsWith("/api/")) {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !path.startsWith("/api/auth/")) {
      const origin = req.headers.get("origin")
      const allowed = new Set(
        [req.headers.get("x-forwarded-host"), req.headers.get("host"), req.nextUrl.host, process.env.AUTH_URL && new URL(process.env.AUTH_URL).host]
          .filter(Boolean) as string[],
      )
      if (origin && origin !== "null" && !allowed.has(new URL(origin).host)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
    return NextResponse.next()
  }
  // Common guessed URLs (/es/auth/signin, /login, /es/iniciar-sesion, /en/dashboard...) → the real page.
  // App pages are not language-prefixed; the language travels as ?lang=.
  const prefixed = path.match(/^\/(es|en)(\/.*)$/)
  const appRoot = /^\/(auth|dashboard|offers|requests|deals|profile|admin|vehicles|users|alerts|onboarding)(\/|$)/
  if (prefixed && appRoot.test(prefixed[2])) {
    const url = new URL(prefixed[2], req.nextUrl)
    req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))
    url.searchParams.set("lang", prefixed[1])
    return NextResponse.redirect(url)
  }
  const loginAlias = path.match(/^\/(?:(es|en)\/)?(login|signin|sign-in|iniciar-sesion|entrar|registro|register|signup)\/?$/)
  if (loginAlias) {
    const lang = loginAlias[1] ?? (["iniciar-sesion", "entrar", "registro"].includes(loginAlias[2]) ? "es" : null)
    return NextResponse.redirect(new URL(`/auth/signin${lang ? `?lang=${lang}` : ""}`, req.nextUrl))
  }

  const hasSession =
    req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token")

  if (PROTECTED.some((p) => startsWith(path, p)) && !hasSession) {
    const to = new URL("/auth/signin", req.nextUrl)
    const l = req.nextUrl.searchParams.get("lang")
    if (l === "es" || l === "en") to.searchParams.set("lang", l)
    return NextResponse.redirect(to)
  }

  // Visitors who chose Spanish in the app land on the Spanish home page
  if (path === "/" && req.cookies.get("NEXT_LOCALE")?.value === "es") {
    return NextResponse.redirect(new URL("/es", req.nextUrl))
  }

  // Sign-in / onboarding opened from a public page carry ?lang=es|en: use it and remember it
  const langParam = req.nextUrl.searchParams.get("lang")
  if ((startsWith(path, "/auth") || startsWith(path, "/onboarding")) && (langParam === "es" || langParam === "en")) {
    const headers = new Headers(req.headers)
    headers.set("x-page-locale", langParam)
    const res = NextResponse.next({ request: { headers } })
    res.cookies.set("NEXT_LOCALE", langParam, { path: "/", maxAge: 365 * 24 * 3600, sameSite: "lax" })
    return res
  }

  // Public pages have a fixed language given by their URL (good for search engines)
  const pageLocale = startsWith(path, "/es") ? "es" : PUBLIC_EN.some((p) => (p === "/" ? path === "/" : startsWith(path, p))) ? "en" : null
  if (pageLocale) {
    const headers = new Headers(req.headers)
    headers.set("x-page-locale", pageLocale)
    return NextResponse.next({ request: { headers } })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image).*)"],
}

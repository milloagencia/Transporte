import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth(function middleware(req) {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/offers") ||
    req.nextUrl.pathname.startsWith("/requests") ||
    req.nextUrl.pathname.startsWith("/deals") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/admin")

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/signin", req.nextUrl))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

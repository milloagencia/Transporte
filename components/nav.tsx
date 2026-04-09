import Link from "next/link"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { getTranslations, getLocale } from "next-intl/server"
import LanguageToggle from "@/components/language-toggle"

export default async function Nav() {
  const session = await auth()
  const t = await getTranslations("nav")
  const locale = await getLocale()
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-blue-600">Collage Transport</Link>
            {session && (
              <>
                <Link href="/offers" className="text-sm text-gray-600 hover:text-gray-900">{t("offers")}</Link>
                <Link href="/requests" className="text-sm text-gray-600 hover:text-gray-900">{t("requests")}</Link>
                <Link href="/deals" className="text-sm text-gray-600 hover:text-gray-900">{t("deals")}</Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle locale={locale} />
            {session ? (
              <>
                <Link href="/profile" className="text-sm text-gray-600">{session.user?.email}</Link>
                <form action="/api/auth/signout" method="post"><Button variant="outline" size="sm" type="submit">{t("signOut")}</Button></form>
              </>
            ) : (
              <Link href="/auth/signin"><Button size="sm">{t("signIn")}</Button></Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

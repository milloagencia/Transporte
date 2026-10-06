import Link from "next/link"
import { getTranslations } from "next-intl/server"

export const metadata = { robots: { index: false } }

export default async function UnsubscribedPage({ searchParams }: { searchParams: Promise<{ invalid?: string }> }) {
  const t = await getTranslations("alerts")
  const { invalid } = await searchParams
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md rounded-lg border bg-white p-6 text-center">
        <p className="text-lg">{invalid ? t("unsubscribedInvalid") : t("unsubscribed")}</p>
        <Link href="/alerts" className="mt-4 inline-block text-blue-700 underline">{t("manage")}</Link>
      </div>
    </div>
  )
}

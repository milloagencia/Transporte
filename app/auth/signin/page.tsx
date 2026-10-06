import RefreshOnBack from "@/components/refresh-on-back"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sendMagicLink } from "./actions"

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; as?: string }> }) {
  // Already signed in (e.g. came back with the browser's Back button): go to the panel
  if ((await auth())?.user) redirect("/dashboard")
  const { error, as } = await searchParams
  const t = await getTranslations("auth")
  const message = error === "missing" ? t("missingEmail") : error === "rate" ? t("rateLimited") : error ? t("sendError") : null

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <RefreshOnBack />
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>{t("signIn")}</CardTitle></CardHeader>
        <CardContent>
          {as === "driver" && <p className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-900">{t("asDriver")}</p>}
          {as === "shipper" && <p className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-900">{t("asShipper")}</p>}
          <form action={sendMagicLink} className="space-y-4">
            {as && <input type="hidden" name="as" value={as} />}
            <div className="space-y-2">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("emailPlaceholder")} required />
            </div>
            {message && <p className="text-sm text-red-600">{message}</p>}
            <Button type="submit" className="w-full">{t("sendLink")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

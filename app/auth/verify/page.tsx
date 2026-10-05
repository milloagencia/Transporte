import RefreshOnBack from "@/components/refresh-on-back"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function VerifyPage() {
  if ((await auth())?.user) redirect("/dashboard")
  const t = await getTranslations("auth")
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <RefreshOnBack />
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>{t("checkEmail")}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600">{t("checkEmailDesc")}</p>
        </CardContent>
      </Card>
    </div>
  )
}

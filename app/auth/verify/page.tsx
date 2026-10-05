import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function VerifyPage() {
  const t = await getTranslations("auth")
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>{t("checkEmail")}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600">{t("checkEmailDesc")}</p>
        </CardContent>
      </Card>
    </div>
  )
}

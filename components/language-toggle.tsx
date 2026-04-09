"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { setLocale } from "@/app/actions/locale"

export default function LanguageToggle({ locale }: { locale: string }) {
  const router = useRouter()

  async function handleLocale(newLocale: string) {
    await setLocale(newLocale)
    router.refresh()
  }

  return (
    <div className="flex gap-1">
      <Button
        variant={locale === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleLocale("en")}
      >
        EN
      </Button>
      <Button
        variant={locale === "es" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleLocale("es")}
      >
        ES
      </Button>
    </div>
  )
}

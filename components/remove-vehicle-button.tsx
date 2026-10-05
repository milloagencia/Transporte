"use client"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export default function RemoveVehicleButton({ id }: { id: string }) {
  const t = useTranslations("vehicles")
  const router = useRouter()
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => {
        await fetch(`/api/vehicles/${id}`, { method: "DELETE" })
        router.refresh()
      }}
    >
      {t("remove")}
    </Button>
  )
}

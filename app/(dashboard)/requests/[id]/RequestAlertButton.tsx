"use client"
import { useTranslations } from "next-intl"
import AlertButton from "@/components/alert-button"

export default function RequestAlertButton({ requestId }: { requestId: string }) {
  const t = useTranslations("alerts")
  return <AlertButton label={t("fromRequestBtn")} payload={() => ({ requestId })} />
}

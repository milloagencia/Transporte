"use client"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

export default function AlertRowActions({ id, active }: { id: string; active: boolean }) {
  const t = useTranslations("alerts")
  const router = useRouter()
  const call = async (method: "PATCH" | "DELETE") => {
    await fetch(`/api/alerts/${id}`, { method, headers: { "Content-Type": "application/json" }, body: method === "PATCH" ? JSON.stringify({ active: !active }) : undefined })
    router.refresh()
  }
  return (
    <div className="flex gap-2 text-sm">
      <button type="button" className="rounded border px-2 py-1 hover:bg-slate-50" onClick={() => call("PATCH")}>{active ? t("pause") : t("resume")}</button>
      <button type="button" className="rounded border border-red-300 px-2 py-1 text-red-700 hover:bg-red-50" onClick={() => call("DELETE")}>{t("delete")}</button>
    </div>
  )
}

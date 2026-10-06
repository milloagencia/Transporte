"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useErrorMessage } from "@/components/form-helpers"
import { setLocale } from "@/app/actions/locale"
import { cn } from "@/lib/utils"

type Initial = {
  wantsToShip: boolean; wantsToDrive: boolean; accountType: "individual" | "company"
  name: string; companyName: string; phone: string; usdotNumber: string; language: "es" | "en"
}

function Choice({ on, onClick, icon, title, text, multi }: { on: boolean; onClick: () => void; icon: string; title: string; text: string; multi?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn("flex w-full items-start gap-3 rounded-lg border-2 bg-white p-4 text-left transition", on ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300")}
    >
      <span className="text-3xl" aria-hidden>{icon}</span>
      <span className="flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-slate-600">{text}</span>
      </span>
      <span className={cn("mt-1 flex h-5 w-5 items-center justify-center border-2 text-xs", multi ? "rounded" : "rounded-full", on ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300")}>{on ? "✓" : ""}</span>
    </button>
  )
}

export default function OnboardingForm({ firstTime, initial }: { firstTime: boolean; initial: Initial }) {
  const t = useTranslations("onboarding")
  const errorMessage = useErrorMessage()
  const router = useRouter()
  const [f, setF] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const set = <K extends keyof Initial>(k: K, v: Initial[K]) => setF((x) => ({ ...x, [k]: v }))
  const company = f.accountType === "company"

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const res = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) })
    if (!res.ok) {
      setError(errorMessage((await res.json().catch(() => ({}))).error))
      setSaving(false)
      return
    }
    await setLocale(f.language)
    // Drivers go set up their vehicle; people who need transport go to offers/new request
    router.replace(!firstTime ? "/profile" : f.wantsToDrive ? "/vehicles?welcome=1" : "/dashboard?welcome=1")
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm font-semibold text-blue-600">Collage Transport</p>
        <h1 className="mt-1 text-2xl font-bold">{firstTime ? t("welcome") : t("editTitle")}</h1>
        {firstTime && <p className="mt-1 text-slate-600">{t("intro")}</p>}
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold">1. {t("q1")} <span className="text-sm font-normal text-slate-500">({t("pickOneOrBoth")})</span></h2>
        <Choice multi on={f.wantsToShip} onClick={() => set("wantsToShip", !f.wantsToShip)} icon="📦" title={t("shipTitle")} text={t("shipText")} />
        <Choice multi on={f.wantsToDrive} onClick={() => set("wantsToDrive", !f.wantsToDrive)} icon="🚚" title={t("driveTitle")} text={t("driveText")} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">2. {t("q2")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Choice on={!company} onClick={() => set("accountType", "individual")} icon="🙋" title={t("individual")} text={t("individualText")} />
          <Choice on={company} onClick={() => set("accountType", "company")} icon="🏢" title={t("company")} text={f.wantsToDrive ? t("companyDriveText") : t("companyShipText")} />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border bg-white p-4">
        <h2 className="font-semibold">3. {t("q3")}</h2>
        {company && (
          <div className="space-y-1">
            <Label htmlFor="company">{t("companyName")}</Label>
            <Input id="company" value={f.companyName} onChange={(e) => set("companyName", e.target.value)} maxLength={100} required />
            <p className="text-xs text-slate-500">{t("companyNameHelp")}</p>
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor="name">{company ? t("contactName") : t("yourName")}</Label>
          <Input id="name" value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={80} required autoComplete="name" />
          {!company && <p className="text-xs text-slate-500">{t("nameHelp")}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="phone">{t("phone")}</Label>
            <Input id="phone" type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(402) 555-0123" autoComplete="tel" />
            <p className="text-xs text-slate-500">{t("phoneHelp")}</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="lang">{t("language")}</Label>
            <select id="lang" className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm" value={f.language} onChange={(e) => set("language", e.target.value as "es" | "en")}>
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        {company && f.wantsToDrive && (
          <div className="space-y-1">
            <Label htmlFor="usdot">{t("usdot")}</Label>
            <Input id="usdot" inputMode="numeric" value={f.usdotNumber} onChange={(e) => set("usdotNumber", e.target.value)} maxLength={12} />
            <p className="text-xs text-slate-500">{t("usdotHelp")}</p>
          </div>
        )}
      </section>

      {f.wantsToDrive && firstTime && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{t("driverNext")}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={saving || (!f.wantsToShip && !f.wantsToDrive)}>
        {saving ? t("saving") : firstTime ? t("continue") : t("save")}
      </Button>
    </form>
  )
}

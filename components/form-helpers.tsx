"use client"
import { useTranslations } from "next-intl"
import { Select } from "@/components/select"
import { US_STATES } from "@/lib/validation"

/** Current local time in the format a datetime-local input expects (YYYY-MM-DDTHH:mm). */
export function nowLocalInput(offsetMinutes = 0) {
  const d = new Date(Date.now() + offsetMinutes * 60_000)
  d.setSeconds(0, 0)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

/** datetime-local values have no timezone; convert them in the browser so the server gets the exact moment. */
export const localToIso = (v: string) => (v ? new Date(v).toISOString() : "")

export function StateSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
    </Select>
  )
}

/** Translates an API error code into a readable message. */
export function useErrorMessage() {
  const t = useTranslations("errors")
  return (code: string | undefined) => (code && t.has(code) ? t(code) : t("generic"))
}

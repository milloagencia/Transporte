/** All dates are shown in Nebraska time (PRD §2: America/Chicago), whatever the server's timezone. */
export const APP_TIME_ZONE = "America/Chicago"

const tag = (locale?: string) => (locale === "en" ? "en-US" : "es-US")

export const formatDateTime = (d: Date | string, locale?: string) =>
  new Date(d).toLocaleString(tag(locale), { timeZone: APP_TIME_ZONE, dateStyle: "medium", timeStyle: "short" })

export const formatDate = (d: Date | string, locale?: string) =>
  new Date(d).toLocaleDateString(tag(locale), { timeZone: APP_TIME_ZONE, dateStyle: "medium" })

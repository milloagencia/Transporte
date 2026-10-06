/** All dates are shown in Nebraska time (PRD §2: America/Chicago), whatever the server's timezone. */
export const APP_TIME_ZONE = "America/Chicago"

export const formatDateTime = (d: Date | string) =>
  new Date(d).toLocaleString("es-US", { timeZone: APP_TIME_ZONE, dateStyle: "medium", timeStyle: "short" })

export const formatDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("es-US", { timeZone: APP_TIME_ZONE, dateStyle: "medium" })

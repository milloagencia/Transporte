import nodemailer from "nodemailer"

// SMTP: either a full URL in EMAIL_SERVER, or separate EMAIL_USER / EMAIL_PASSWORD (Hostinger / Titan email)
export const EMAIL_SERVER =
  process.env.EMAIL_SERVER ||
  (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD
    ? {
        host: process.env.EMAIL_HOST || "smtp.hostinger.com",
        port: Number(process.env.EMAIL_PORT || 465),
        secure: Number(process.env.EMAIL_PORT || 465) === 465,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
      }
    : undefined)

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Collage Transport <noreply@collagetaxi.com>"

let transport: { sendMail: (msg: Record<string, unknown>) => Promise<unknown> } | null = null

/** Sends an email; without SMTP configured (local development) it only logs it. */
export async function sendMail(to: string, subject: string, text: string, html: string) {
  if (!EMAIL_SERVER) {
    console.log(`\n✉️  ${to} — ${subject}\n${text}\n`)
    return
  }
  transport ??= nodemailer.createTransport(EMAIL_SERVER)
  await transport.sendMail({ from: EMAIL_FROM, to, subject, text, html })
}

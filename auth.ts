import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Nodemailer from "next-auth/providers/nodemailer"
import { db } from "@/lib/db"
import { EMAIL_FROM, EMAIL_SERVER, sendMail } from "@/lib/mail"

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const emailProvider = Nodemailer({
  id: "email",
  name: "Email",
  server: EMAIL_SERVER ?? { jsonTransport: true },
  from: EMAIL_FROM,
  maxAge: 24 * 60 * 60,
  // Bilingual sign-in email (without EMAIL_SERVER, sendMail only prints it to the console)
  sendVerificationRequest: async ({ identifier, url }: { identifier: string; url: string }) => {
    const subject = "Tu enlace para entrar · Your sign-in link — Collage Transport"
    const text = `Entra a Collage Transport con este enlace (válido 24 horas):\n${url}\n\nSign in to Collage Transport with this link (valid for 24 hours):\n${url}\n\nSi no lo pediste, ignora este correo. / If you didn't request it, ignore this email.`
    const button = (label: string) => `<a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">${label}</a>`
    const html = `<div style="font-family:Arial,sans-serif;max-width:520px">
      <p style="font-size:18px;font-weight:bold;color:#2563eb">Collage Transport</p>
      <p>Toca el botón para entrar. El enlace vale 24 horas.</p><p>${button("Entrar")}</p>
      <p style="margin-top:20px">Tap the button to sign in. The link is valid for 24 hours.</p><p>${button("Sign in")}</p>
      <p style="font-size:12px;color:#64748b;margin-top:24px">Si no lo pediste, ignora este correo. · If you didn't request it, ignore this email.</p>
    </div>`
    await sendMail(identifier, subject, text, html)
  },
})

async function promoteIfAdmin(userId?: string | null, email?: string | null) {
  if (!userId || !email || !ADMIN_EMAILS.includes(email.toLowerCase())) return
  await db.$transaction(async (tx) => {
    const changed = await tx.user.updateMany({ where: { id: userId, role: { not: "admin" } }, data: { role: "admin" } })
    if (changed.count) {
      await tx.mobileSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } })
    }
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [emailProvider],
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  events: {
    // Users listed in ADMIN_EMAIL become admins on sign-in
    signIn: async ({ user }) => promoteIfAdmin(user.id, user.email),
  },
  callbacks: {
    // Deleted accounts cannot sign in again
    signIn: async ({ user }) => {
      if (!user?.email) return true
      const existing = await db.user.findUnique({ where: { email: user.email.toLowerCase() }, select: { status: true } })
      return existing?.status !== "deleted"
    },
    session: async ({ session, user }) => {
      if (session.user && user) {
        // Only expose what the app needs (the adapter hands us the whole DB row)
        const full = user as typeof user & { role?: string; status?: string; wantsToDrive?: boolean; wantsToShip?: boolean; onboardedAt?: Date | null }
        session.user = {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
          emailVerified: user.emailVerified ?? null,
          role: full.role ?? "user",
          status: full.status ?? "active",
          wantsToDrive: Boolean(full.wantsToDrive),
          wantsToShip: Boolean(full.wantsToShip),
          onboarded: Boolean(full.onboardedAt),
        } as typeof session.user
      }
      return session
    },
  },
})

import type { Metadata } from "next"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { MOBILE_CODE_MINUTES, randomSecret, hashSecret } from "@/lib/mobile-auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Confirmar acceso móvil · Collage Transport",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default async function MobileConfirmPage({ searchParams }: { searchParams: Promise<{ requestId?: string }> }) {
  const session = await auth()
  const user = session?.user as { id?: string; email?: string | null; status?: string } | undefined
  if (!user?.id || !user.email || user.status === "suspended" || user.status === "deleted") {
    return <main className="mx-auto max-w-lg space-y-4 p-6"><h1 className="text-2xl font-bold">No se pudo confirmar</h1><p>Inicia sesión desde la app y abre el enlace mágico más reciente.</p></main>
  }

  const { requestId } = await searchParams
  if (!requestId) return <main className="mx-auto max-w-lg space-y-4 p-6"><h1 className="text-2xl font-bold">Solicitud incompleta</h1><p>Vuelve a la app y solicita un enlace nuevo.</p></main>

  const now = new Date()
  const authRequest = await db.mobileAuthRequest.findUnique({ where: { id: requestId } })
  if (!authRequest || authRequest.email !== user.email.toLowerCase() || authRequest.expiresAt <= now || authRequest.codeUsedAt || authRequest.codeHash) {
    return <main className="mx-auto max-w-lg space-y-4 p-6"><h1 className="text-2xl font-bold">Enlace vencido o ya usado</h1><p>Vuelve a la app y solicita un enlace mágico nuevo.</p></main>
  }

  const code = randomSecret()
  const codeExpiresAt = new Date(now.getTime() + MOBILE_CODE_MINUTES * 60 * 1000)
  const created = await db.mobileAuthRequest.updateMany({
    where: { id: requestId, email: user.email.toLowerCase(), expiresAt: { gt: now }, codeHash: null, codeUsedAt: null },
    data: { codeHash: hashSecret(code), codeExpiresAt },
  })
  if (created.count !== 1) {
    return <main className="mx-auto max-w-lg space-y-4 p-6"><h1 className="text-2xl font-bold">Enlace ya utilizado</h1><p>Vuelve a la app y solicita un enlace mágico nuevo.</p></main>
  }

  return (
    <main className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-bold">Confirma el acceso a Collage Transport</h1>
      <p>Escribe este código en la app donde iniciaste sesión. Solo sirve para esa solicitud y vence en 10 minutos.</p>
      <code className="block select-all break-all rounded border bg-slate-50 p-4 text-lg">{code}</code>
      <p className="text-sm text-slate-600">No compartas este código. Al usarlo, la app recibirá una sesión segura para este teléfono.</p>
    </main>
  )
}

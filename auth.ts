import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Provider } from "next-auth/providers"
import { db } from "@/lib/db"

const providers: Provider[] = [
  {
    id: "email",
    type: "email",
    name: "Email",
    from: "noreply@collage-transport.com",
    server: {},
    maxAge: 24 * 60 * 60,
    options: {},
    sendVerificationRequest: async ({ identifier, url }: { identifier: string; url: string }) => {
      console.log(`\n🔗 Magic Link for ${identifier}:\n${url}\n`)
    },
  } as unknown as Provider,
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers,
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    session: async ({ session, user }) => {
      if (session.user && user) {
        (session.user as typeof session.user & { id: string; role: string }).id = user.id
      }
      return session
    },
  },
})

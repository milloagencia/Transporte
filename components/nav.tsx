import Link from "next/link"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"

export default async function Nav() {
  const session = await auth()
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-blue-600">Collage Transport</Link>
            {session && (
              <>
                <Link href="/offers" className="text-sm text-gray-600 hover:text-gray-900">Offers</Link>
                <Link href="/requests" className="text-sm text-gray-600 hover:text-gray-900">Requests</Link>
                <Link href="/deals" className="text-sm text-gray-600 hover:text-gray-900">Deals</Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/profile" className="text-sm text-gray-600">{session.user?.email}</Link>
                <form action="/api/auth/signout" method="post"><Button variant="outline" size="sm" type="submit">Sign Out</Button></form>
              </>
            ) : (
              <Link href="/auth/signin"><Button size="sm">Sign In</Button></Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Collage Transport</h1>
        <p className="text-lg text-gray-600">
          Connect drivers with empty seats to people and cargo that need a ride — in Nebraska.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signin"><Button size="lg">Get Started</Button></Link>
          <Link href="/offers"><Button variant="outline" size="lg">Browse Offers</Button></Link>
        </div>
      </div>
    </main>
  )
}

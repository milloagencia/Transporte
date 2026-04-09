import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Check your email</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-600">A sign in link has been sent to your email address. Check your server console in development.</p>
        </CardContent>
      </Card>
    </div>
  )
}

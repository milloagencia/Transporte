import { db } from "@/lib/db"
import { auth } from "@/auth"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTranslations } from "next-intl/server"

export default async function DealsPage() {
  const session = await auth()
  if (!session?.user) return null
  const userId = (session.user as { id: string }).id
  const t = await getTranslations("deals")
  const ts = await getTranslations("status")

  const deals = await db.deal.findMany({
    where: { OR: [{ driverId: userId }, { requesterId: userId }] },
    include: {
      driver: { select: { name: true } },
      requester: { select: { name: true } },
      proposals: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      {deals.length === 0 ? (
        <p className="text-gray-500">{t("none")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {deals.map((d) => (
            <Link key={d.id} href={`/deals/${d.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader><CardTitle className="text-base">{t("dealNo", { id: d.id.slice(-8) })}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant={d.status === "completed" ? "success" : d.status === "cancelled" ? "destructive" : "default"}>
                    {ts(d.status)}
                  </Badge>
                  <p className="text-sm">{t("driver")}: {d.driver.name ?? t("user")}</p>
                  <p className="text-sm">{t("requester")}: {d.requester.name ?? t("user")}</p>
                  {d.proposals[0] && <p className="text-sm">{t("latest", { price: d.proposals[0].price })}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

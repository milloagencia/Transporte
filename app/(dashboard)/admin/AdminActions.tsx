"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function AdminActions({ userId }: { userId: string }) {
  const router = useRouter()

  async function action(status: "approved" | "rejected") {
    await fetch(`/api/admin/drivers/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => action("approved")}>Approve</Button>
      <Button size="sm" variant="destructive" onClick={() => action("rejected")}>Reject</Button>
    </div>
  )
}

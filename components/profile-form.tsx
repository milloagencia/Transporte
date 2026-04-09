"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setLocale } from "@/app/actions/locale"

interface ProfileFormProps {
  name: string | null
  language: string
}

export default function ProfileForm({ name, language }: ProfileFormProps) {
  const router = useRouter()
  const [formName, setFormName] = useState(name ?? "")
  const [formLang, setFormLang] = useState(language)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, language: formLang }),
      })
      if (!res.ok) throw new Error("Failed to save")
      await setLocale(formLang)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Name</Label>
        <Input
          id="profile-name"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <div className="space-y-2">
        <Label>Language / Idioma</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={formLang === "en" ? "default" : "outline"}
            onClick={() => setFormLang("en")}
          >
            English
          </Button>
          <Button
            type="button"
            variant={formLang === "es" ? "default" : "outline"}
            onClick={() => setFormLang("es")}
          >
            Español
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}

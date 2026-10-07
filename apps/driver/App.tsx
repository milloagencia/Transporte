import { useState } from "react"
import { StatusBar } from "expo-status-bar"
import { MobileLogin } from "@collage/shared"
import { DriverHome } from "./DriverHome"

export default function App() {
  const [language, setLanguage] = useState<"es" | "en">("es")
  return (
    <>
      <MobileLogin
        language={language}
        onLanguageChange={setLanguage}
        authenticatedContent={(user, activeLanguage) => <DriverHome user={user} language={activeLanguage} />}
      />
      <StatusBar style="auto" />
    </>
  )
}

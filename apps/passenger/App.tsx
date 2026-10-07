import { useState } from "react"
import { StatusBar } from "expo-status-bar"
import { MobileLogin } from "@collage/shared"
import { PassengerHome } from "./PassengerHome"

export default function App() {
  const [language, setLanguage] = useState<"es" | "en">("es")
  return (
    <>
      <MobileLogin
        language={language}
        onLanguageChange={setLanguage}
        authenticatedContent={(user, activeLanguage) => <PassengerHome user={user} language={activeLanguage} />}
      />
      <StatusBar style="auto" />
    </>
  )
}

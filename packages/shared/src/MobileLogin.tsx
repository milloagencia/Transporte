import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import {
  clearAccessToken,
  exchangeMobileCode,
  getAccessToken,
  mobileApiRequest,
  sendMobileMagicLink,
  signOutMobile,
  startMobileAuthRequest,
} from "./api"

type Language = "es" | "en"
type User = { id: string; role: string; status: string }

const COPY = {
  es: {
    title: "Collage Transport",
    subtitle: "Accede con tu correo, sin contraseña",
    email: "Correo electrónico",
    send: "Enviar enlace mágico",
    code: "Código de confirmación",
    verify: "Confirmar acceso",
    logout: "Cerrar sesión",
    sent: "Revisa tu correo. Abre el enlace y escribe aquí el código que aparece.",
    loggedIn: "Sesión iniciada",
    loading: "Un momento…",
    error: "No se pudo completar. Revisa los datos e inténtalo otra vez.",
  },
  en: {
    title: "Collage Transport",
    subtitle: "Sign in with your email, no password",
    email: "Email address",
    send: "Send magic link",
    code: "Confirmation code",
    verify: "Confirm sign-in",
    logout: "Sign out",
    sent: "Check your email. Open the link and enter the code shown here.",
    loggedIn: "Signed in",
    loading: "One moment…",
    error: "Could not complete sign-in. Check the details and try again.",
  },
}

export function MobileLogin({
  language = "es",
  authenticatedContent,
  onLanguageChange,
}: {
  language?: Language
  authenticatedContent?: (user: User, language: Language) => ReactNode
  onLanguageChange?: (language: Language) => void
}) {
  const text = COPY[language]
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [requestId, setRequestId] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let mounted = true
    getAccessToken().then((token) => {
      if (!token) return
      mobileApiRequest<User>("/api/v1/mobile/me")
        .then((current) => { if (mounted) setUser(current) })
        .catch(() => { if (mounted) clearAccessToken() })
    }).catch(() => undefined)
    return () => { mounted = false }
  }, [])

  async function requestLink() {
    setBusy(true)
    setMessage("")
    try {
      const request = await startMobileAuthRequest()
      await sendMobileMagicLink(request.requestId, email)
      setRequestId(request.requestId)
      setMessage(text.sent)
    } catch {
      setMessage(text.error)
    } finally {
      setBusy(false)
    }
  }

  async function confirmCode() {
    setBusy(true)
    setMessage("")
    try {
      await exchangeMobileCode(requestId, code.trim())
      const current = await mobileApiRequest<User>("/api/v1/mobile/me")
      setUser(current)
    } catch {
      setMessage(text.error)
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    try {
      await signOutMobile()
      setUser(null)
      setRequestId("")
      setCode("")
      setMessage("")
    } catch {
      setMessage(text.error)
    } finally {
      setUser(null)
      setRequestId("")
      setCode("")
      setBusy(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{text.title}</Text>
      {user ? (
        <>
          {authenticatedContent ? (
            <>
              {authenticatedContent(user, language)}
              <Pressable disabled={busy} onPress={logout} style={styles.button}>
                <Text style={styles.buttonText}>{text.logout}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>{text.loggedIn}</Text>
              <Text>{user.role}</Text>
              <Pressable disabled={busy} onPress={logout} style={styles.button}>
                <Text style={styles.buttonText}>{text.logout}</Text>
              </Pressable>
            </>
          )}
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>{text.subtitle}</Text>
          <TextInput
            accessibilityLabel={text.email}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder={text.email}
            style={styles.input}
            value={email}
          />
          {!requestId ? (
            <Pressable disabled={busy || !email.trim()} onPress={requestLink} style={styles.button}>
              {busy ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{text.send}</Text>}
            </Pressable>
          ) : (
            <>
              <Text style={styles.message}>{text.sent}</Text>
              <TextInput
                accessibilityLabel={text.code}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setCode}
                placeholder={text.code}
                style={styles.input}
                value={code}
              />
              <Pressable disabled={busy || !code.trim()} onPress={confirmCode} style={styles.button}>
                {busy ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{text.verify}</Text>}
              </Pressable>
            </>
          )}
        </>
      )}
      {onLanguageChange && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={language === "es" ? "Switch language to English" : "Cambiar idioma a español"}
          onPress={() => onLanguageChange(language === "es" ? "en" : "es")}
        >
          <Text style={styles.language}>{language === "es" ? "English" : "Español"}</Text>
        </Pressable>
      )}
      {!!message && <Text accessibilityRole="alert" style={styles.message}>{message}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", gap: 16, padding: 24, backgroundColor: "white" },
  title: { fontSize: 28, fontWeight: "700", color: "#0f172a" },
  subtitle: { fontSize: 16, color: "#475569" },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 8, padding: 12, fontSize: 16 },
  button: { alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 8, backgroundColor: "#2563eb", padding: 12 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  message: { color: "#334155", lineHeight: 22 },
  language: { color: "#1d4ed8", fontWeight: "600", textAlign: "center" },
})

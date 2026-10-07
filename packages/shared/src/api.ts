import * as Crypto from "expo-crypto"
import * as SecureStore from "expo-secure-store"

const ACCESS_TOKEN_KEY = "collage.mobile.access-token"
const VERIFIER_KEY_PREFIX = "collage.mobile.pkce."
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://app.collagetaxi.com"

export async function storeAccessToken(token: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token)
}

export async function clearAccessToken() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
}

async function apiRequest<T>(
  path: string,
  body?: unknown,
  authenticated = false,
  method?: "GET" | "POST" | "PATCH",
): Promise<T> {
  const headers = new Headers({ "Content-Type": "application/json" })
  if (authenticated) {
    const token = await getAccessToken()
    if (token) headers.set("Authorization", "Bearer".concat(" ", token))
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401 && authenticated) await clearAccessToken()
    throw new Error(typeof result.error === "string" ? result.error : "request_failed")
  }
  return result as T
}

function encodeBase64Url(bytes: Uint8Array) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  let encoded = ""
  for (let i = 0; i < bytes.length; i += 3) {
    const first = bytes[i]
    const second = bytes[i + 1]
    const third = bytes[i + 2]
    encoded += alphabet[first >> 2]
    encoded += alphabet[((first & 3) << 4) | (second === undefined ? 0 : second >> 4)]
    if (second !== undefined) encoded += alphabet[((second & 15) << 2) | (third === undefined ? 0 : third >> 6)]
    if (third !== undefined) encoded += alphabet[third & 63]
  }
  return encoded
}

export async function startMobileAuthRequest() {
  const verifier = encodeBase64Url(await Crypto.getRandomBytesAsync(32))
  const encodedChallenge = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  )
  const codeChallenge = encodedChallenge.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  const request = await apiRequest<{ id: string }>("/api/v1/mobile/auth/requests", { codeChallenge })
  await SecureStore.setItemAsync(`${VERIFIER_KEY_PREFIX}${request.id}`, verifier)
  return { requestId: request.id }
}

export async function sendMobileMagicLink(requestId: string, email: string) {
  return apiRequest<{ ok: true; message: string }>("/api/v1/mobile/auth/login", { requestId, email })
}

export async function exchangeMobileCode(requestId: string, code: string) {
  const verifierKey = `${VERIFIER_KEY_PREFIX}${requestId}`
  const verifier = await SecureStore.getItemAsync(verifierKey)
  if (!verifier) throw new Error("auth_request_not_found")
  const result = await apiRequest<{ accessToken: string; expiresAt: string }>(
    "/api/v1/mobile/auth/exchange",
    { requestId, code, verifier },
  )
  await storeAccessToken(result.accessToken)
  await SecureStore.deleteItemAsync(verifierKey)
  return result
}

export async function signOutMobile() {
  try {
    await apiRequest("/api/v1/mobile/auth/logout", {}, true)
  } finally {
    await clearAccessToken()
  }
}

export async function mobileApiRequest<T>(path: string, body?: unknown) {
  return apiRequest<T>(path, body, true)
}

export async function mobileApiPatch<T>(path: string, body: unknown) {
  return apiRequest<T>(path, body, true, "PATCH")
}

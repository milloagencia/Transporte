import { Rest, type capabilityOp } from "ably"

let ably: Rest | undefined

export function realtimeConfigured() {
  return Boolean(process.env.ABLY_API_KEY)
}

export async function publishLocationUpdate(dealId: string, payload: Record<string, unknown>) {
  const key = process.env.ABLY_API_KEY
  if (!key) return false
  try {
    ably ??= new Rest({ key })
    const message = { name: "location", data: payload }
    await Promise.all([
      ably.channels.get(`tracking:${dealId}`).publish(message),
      ably.channels.get("admin:live").publish(message),
    ])
    return true
  } catch (error) {
    console.error("[live-updates] Ably publish failed; polling remains available", error)
    return false
  }
}

export async function createRealtimeToken(userId: string, capability: Record<string, capabilityOp[]>) {
  const key = process.env.ABLY_API_KEY
  if (!key) return null
  try {
    ably ??= new Rest({ key })
    return await ably.auth.createTokenRequest({
      clientId: userId,
      capability,
      ttl: 60 * 60 * 1000,
    })
  } catch (error) {
    console.error("[live-updates] Ably token request failed; polling remains available", error)
    return null
  }
}

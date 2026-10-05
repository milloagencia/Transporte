// Simple in-memory rate limiter (one Node process on Hostinger).
// Enough to stop someone from spamming sign-in emails; resets when the app restarts.
const hits = new Map<string, number[]>()

export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const list = (hits.get(key) ?? []).filter((t) => t > now - windowMs)
  list.push(now)
  hits.set(key, list)
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v[v.length - 1] < now - windowMs) hits.delete(k)
  }
  return list.length > max
}

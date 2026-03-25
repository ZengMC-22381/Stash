import type { NextRequest } from "next/server"

export type RateLimitRule = {
  id: string
  windowMs: number
  max: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitStore = Map<string, RateLimitEntry>

type RateLimitGlobal = typeof globalThis & {
  __stashRateLimitStore?: RateLimitStore
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
  resetAt: number
  headers: Record<string, string>
}

function getStore(): RateLimitStore {
  const scope = globalThis as RateLimitGlobal
  if (!scope.__stashRateLimitStore) {
    scope.__stashRateLimitStore = new Map()
  }
  return scope.__stashRateLimitStore
}

function cleanupExpiredEntries(store: RateLimitStore, now: number) {
  if (store.size < 5000) return
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}

function buildRateLimitHeaders(rule: RateLimitRule, remaining: number, resetAt: number, retryAfterSeconds: number) {
  return {
    "X-RateLimit-Limit": String(rule.max),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    "Retry-After": String(Math.max(0, retryAfterSeconds)),
  }
}

export function parseClientAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp

  return "unknown"
}

export function applyRateLimit(key: string, rule: RateLimitRule, now = Date.now()): RateLimitResult {
  const store = getStore()
  cleanupExpiredEntries(store, now)

  const existing = store.get(key)
  let entry = existing

  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + rule.windowMs,
    }
  }

  if (entry.count >= rule.max) {
    const retryAfterSeconds = Math.max(0, Math.ceil((entry.resetAt - now) / 1000))
    const headers = buildRateLimitHeaders(rule, 0, entry.resetAt, retryAfterSeconds)
    store.set(key, entry)
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      resetAt: entry.resetAt,
      headers,
    }
  }

  entry.count += 1
  store.set(key, entry)

  const remaining = Math.max(0, rule.max - entry.count)
  const retryAfterSeconds = Math.max(0, Math.ceil((entry.resetAt - now) / 1000))
  const headers = buildRateLimitHeaders(rule, remaining, entry.resetAt, retryAfterSeconds)

  return {
    allowed: true,
    remaining,
    retryAfterSeconds,
    resetAt: entry.resetAt,
    headers,
  }
}

export function enforceRateLimit(
  request: NextRequest,
  rule: RateLimitRule,
  subject?: string | null,
  now = Date.now()
): RateLimitResult {
  const identity = subject?.trim() || parseClientAddress(request)
  const key = `${rule.id}:${identity}`
  return applyRateLimit(key, rule, now)
}

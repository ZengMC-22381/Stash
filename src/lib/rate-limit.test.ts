import { describe, expect, it } from "vitest"
import { applyRateLimit, type RateLimitRule } from "@/lib/rate-limit"

describe("applyRateLimit", () => {
  const rule: RateLimitRule = {
    id: "test-rate-limit",
    windowMs: 1000,
    max: 2,
  }

  it("allows requests up to max", () => {
    const key = `spec-allow-${Date.now()}`
    const first = applyRateLimit(key, rule, 0)
    const second = applyRateLimit(key, rule, 1)

    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(true)
    expect(second.remaining).toBe(0)
  })

  it("blocks after reaching max", () => {
    const key = `spec-block-${Date.now()}`
    applyRateLimit(key, rule, 0)
    applyRateLimit(key, rule, 1)
    const blocked = applyRateLimit(key, rule, 2)

    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(Number(blocked.headers["Retry-After"])).toBeGreaterThanOrEqual(0)
  })

  it("resets after time window", () => {
    const key = `spec-reset-${Date.now()}`
    applyRateLimit(key, rule, 0)
    applyRateLimit(key, rule, 1)
    const afterWindow = applyRateLimit(key, rule, 1200)

    expect(afterWindow.allowed).toBe(true)
    expect(afterWindow.remaining).toBe(1)
  })
})

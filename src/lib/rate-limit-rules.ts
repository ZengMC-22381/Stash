import type { RateLimitRule } from "@/lib/rate-limit"

export const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  authLogin: { id: "auth-login", windowMs: 10 * 60 * 1000, max: 20 },
  authRegister: { id: "auth-register", windowMs: 60 * 60 * 1000, max: 10 },
  resourceCreate: { id: "resource-create", windowMs: 60 * 60 * 1000, max: 30 },
  interactionWrite: { id: "resource-interaction-write", windowMs: 60 * 60 * 1000, max: 180 },
  remixCreate: { id: "resource-remix-create", windowMs: 60 * 60 * 1000, max: 40 },
  commentCreate: { id: "resource-comment-create", windowMs: 60 * 60 * 1000, max: 80 },
  ratingCreate: { id: "resource-rating-create", windowMs: 60 * 60 * 1000, max: 120 },
  copyTrack: { id: "resource-copy-track", windowMs: 60 * 60 * 1000, max: 240 },
  uploadImages: { id: "upload-images", windowMs: 60 * 60 * 1000, max: 40 },
}

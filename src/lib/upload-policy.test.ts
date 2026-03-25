import { describe, expect, it } from "vitest"
import { resolveUploadExtension, validateUploadBatch } from "@/lib/upload-policy"

describe("validateUploadBatch", () => {
  it("accepts a valid batch", () => {
    const result = validateUploadBatch([
      { name: "a.png", type: "image/png", size: 1024 },
      { name: "b.jpg", type: "image/jpeg", size: 2048 },
    ])
    expect(result.ok).toBe(true)
  })

  it("rejects invalid mime types", () => {
    const result = validateUploadBatch([{ name: "a.svg", type: "image/svg+xml", size: 1000 }])
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.status).toBe(400)
  })
})

describe("resolveUploadExtension", () => {
  it("uses mime type first", () => {
    expect(resolveUploadExtension({ type: "image/webp", name: "image.png", size: 1 })).toBe(".webp")
  })

  it("falls back to file name extension", () => {
    expect(resolveUploadExtension({ type: "", name: "image.jpeg", size: 1 })).toBe(".jpg")
  })
})

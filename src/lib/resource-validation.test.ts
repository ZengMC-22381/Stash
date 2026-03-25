import { describe, expect, it } from "vitest"
import { validateCommentContent, validateResourcePayload } from "@/lib/resource-validation"

describe("validateResourcePayload", () => {
  it("accepts a valid payload and normalizes tags", () => {
    const result = validateResourcePayload({
      title: "  Stash Resource  ",
      description: "A practical resource for landing page generation.",
      content: "# RESOURCE.md\n\n## Goal\nCreate a compelling landing page flow.",
      tags: ["Minimal", "minimal", "CustomTag"],
      images: ["https://example.com/preview.png", { url: "/uploads/local.png", caption: "Local" }],
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.value.title).toBe("Stash Resource")
    expect(result.value.tags).toEqual(["Minimal", "CustomTag"])
    expect(result.value.images).toHaveLength(2)
  })

  it("rejects invalid image url", () => {
    const result = validateResourcePayload({
      title: "Valid title",
      description: "This description is long enough to pass validation.",
      content: "# RESOURCE.md\n\n## Goal\nBuild something useful with the resource.",
      tags: [],
      images: ["javascript:alert(1)"],
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toContain("Image URL")
  })
})

describe("validateCommentContent", () => {
  it("rejects empty comments", () => {
    const result = validateCommentContent("   ")
    expect(result.ok).toBe(false)
  })

  it("accepts a valid comment", () => {
    const result = validateCommentContent("Looks good, thanks for sharing.")
    expect(result.ok).toBe(true)
  })
})

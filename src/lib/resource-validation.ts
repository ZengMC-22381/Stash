import { normalizeResourceTagValues } from "@/lib/resource-definition"

export type NormalizedImageInput = {
  url: string
  caption?: string
  order: number
}

export type ResourcePayloadValidationResult =
  | {
      ok: true
      value: {
        title: string
        description: string
        content: string
        tags: string[]
        images: NormalizedImageInput[]
      }
    }
  | {
      ok: false
      error: string
    }

export const RESOURCE_VALIDATION_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  descriptionMin: 10,
  descriptionMax: 500,
  contentMin: 20,
  contentMax: 50_000,
  maxTags: 20,
  maxTagLength: 48,
  maxImages: 12,
  maxCaptionLength: 120,
}

function isValidImageUrl(url: string) {
  if (url.startsWith("/uploads/")) return true

  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function normalizeImageInputs(input: unknown): NormalizedImageInput[] {
  if (!Array.isArray(input)) return []

  return input
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          url: item.trim(),
          order: index,
        }
      }

      if (item && typeof item === "object" && "url" in item) {
        const typed = item as { url?: string; caption?: string; order?: number }
        return {
          url: String(typed.url || "").trim(),
          caption: typed.caption ? String(typed.caption).trim() : undefined,
          order: typeof typed.order === "number" && Number.isFinite(typed.order) ? typed.order : index,
        }
      }

      return null
    })
    .filter((item): item is NormalizedImageInput => Boolean(item && item.url))
}

export function validateResourcePayload(input: {
  title: string
  description: string
  content: string
  tags: unknown
  images: unknown
}): ResourcePayloadValidationResult {
  const title = input.title.trim()
  const description = input.description.trim()
  const content = input.content.trim()

  if (title.length < RESOURCE_VALIDATION_LIMITS.titleMin || title.length > RESOURCE_VALIDATION_LIMITS.titleMax) {
    return {
      ok: false,
      error: `Title must be ${RESOURCE_VALIDATION_LIMITS.titleMin}-${RESOURCE_VALIDATION_LIMITS.titleMax} characters.`,
    }
  }

  if (
    description.length < RESOURCE_VALIDATION_LIMITS.descriptionMin ||
    description.length > RESOURCE_VALIDATION_LIMITS.descriptionMax
  ) {
    return {
      ok: false,
      error: `Description must be ${RESOURCE_VALIDATION_LIMITS.descriptionMin}-${RESOURCE_VALIDATION_LIMITS.descriptionMax} characters.`,
    }
  }

  if (content.length < RESOURCE_VALIDATION_LIMITS.contentMin || content.length > RESOURCE_VALIDATION_LIMITS.contentMax) {
    return {
      ok: false,
      error: `Content must be ${RESOURCE_VALIDATION_LIMITS.contentMin}-${RESOURCE_VALIDATION_LIMITS.contentMax} characters.`,
    }
  }

  const tags = Array.from(
    new Map(
      normalizeResourceTagValues(input.tags).map((tag) => [tag.toLowerCase(), tag])
    ).values()
  )
  if (tags.length > RESOURCE_VALIDATION_LIMITS.maxTags) {
    return {
      ok: false,
      error: `Too many tags. Maximum allowed is ${RESOURCE_VALIDATION_LIMITS.maxTags}.`,
    }
  }

  if (tags.some((tag) => tag.length > RESOURCE_VALIDATION_LIMITS.maxTagLength)) {
    return {
      ok: false,
      error: `Tag length must be at most ${RESOURCE_VALIDATION_LIMITS.maxTagLength} characters.`,
    }
  }

  const images = normalizeImageInputs(input.images)
  if (images.length > RESOURCE_VALIDATION_LIMITS.maxImages) {
    return {
      ok: false,
      error: `Too many images. Maximum allowed is ${RESOURCE_VALIDATION_LIMITS.maxImages}.`,
    }
  }

  for (const image of images) {
    if (!isValidImageUrl(image.url)) {
      return { ok: false, error: "Image URL must be an absolute http(s) URL or a local /uploads/ path." }
    }

    if (image.caption && image.caption.length > RESOURCE_VALIDATION_LIMITS.maxCaptionLength) {
      return {
        ok: false,
        error: `Image caption length must be at most ${RESOURCE_VALIDATION_LIMITS.maxCaptionLength} characters.`,
      }
    }
  }

  return {
    ok: true,
    value: {
      title,
      description,
      content,
      tags,
      images,
    },
  }
}

export function validateCommentContent(input: unknown): { ok: true; value: string } | { ok: false; error: string } {
  const content = typeof input === "string" ? input.trim() : ""
  if (!content) {
    return { ok: false, error: "Content is required." }
  }
  if (content.length > 2000) {
    return { ok: false, error: "Comment is too long. Maximum length is 2000 characters." }
  }
  return { ok: true, value: content }
}

import { normalizeResourceTagValues } from "@/lib/resource-definition"

export type NormalizedImageInput = {
  url: string
  caption?: string
  order: number
}

export type ResourceContentBlockType = "markdown" | "link" | "file"

export type NormalizedResourceContentBlock =
  | {
      type: "markdown"
      order: number
      markdown: string
    }
  | {
      type: "link"
      order: number
      url: string
      title: string
      previewImageUrl?: string
    }
  | {
      type: "file"
      order: number
      fileUrl: string
      fileName: string
      fileSizeBytes: number
      mimeType?: string
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
        contentBlocks: NormalizedResourceContentBlock[]
      }
    }
  | {
      ok: false
      error: string
    }

export const RESOURCE_VALIDATION_LIMITS = {
  titleMin: 3,
  titleMax: 120,
  descriptionMax: 500,
  contentMin: 20,
  contentMax: 50_000,
  maxTags: 20,
  maxTagLength: 48,
  maxImages: 15,
  maxCaptionLength: 120,
  maxContentBlocks: 10,
  maxLinkTitleLength: 160,
  maxUrlLength: 2048,
  maxFileNameLength: 180,
  maxFileSizeBytes: 50 * 1024 * 1024,
} as const

function isValidHttpUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

function isValidUploadPath(url: string) {
  return url.startsWith("/uploads/")
}

function isValidImageUrl(url: string) {
  return isValidUploadPath(url) || isValidHttpUrl(url)
}

function normalizeText(input: unknown) {
  return typeof input === "string" ? input.trim() : ""
}

function deriveLinkTitle(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./i, "")
    return host || url
  } catch {
    return url
  }
}

function summarizeForDescription(input: string, max = 160) {
  const cleaned = input
    .replace(/\r/g, "")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()

  if (!cleaned) return ""
  if (cleaned.length <= max) return cleaned
  return `${cleaned.slice(0, max).trimEnd()}...`
}

function buildLegacyContentFromBlocks(blocks: NormalizedResourceContentBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "markdown") {
        return block.markdown
      }
      if (block.type === "link") {
        return [`## Link`, block.title, block.url].join("\n")
      }
      return [`## File`, block.fileName, block.fileUrl].join("\n")
    })
    .filter(Boolean)
    .join("\n\n")
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

export function normalizeContentBlocks(input: unknown): NormalizedResourceContentBlock[] {
  if (!Array.isArray(input)) return []

  return input
    .map((item, index) => {
      if (!item || typeof item !== "object") return null
      const raw = item as Record<string, unknown>
      const type = normalizeText(raw.type).toLowerCase()

      if (type === "markdown") {
        const markdown = normalizeText(raw.markdown || raw.content)
        return {
          type: "markdown" as const,
          order: index,
          markdown,
        }
      }

      if (type === "link") {
        const url = normalizeText(raw.url || raw.linkUrl)
        const title = normalizeText(raw.title || raw.linkTitle || raw.name)
        const previewImageUrl = normalizeText(raw.previewImageUrl || raw.linkPreviewImageUrl || raw.image)
        return {
          type: "link" as const,
          order: index,
          url,
          title,
          previewImageUrl: previewImageUrl || undefined,
        }
      }

      if (type === "file") {
        const fileUrl = normalizeText(raw.fileUrl || raw.url)
        const fileName = normalizeText(raw.fileName || raw.name)
        const fileSizeBytesRaw = Number(raw.fileSizeBytes ?? raw.size ?? 0)
        const fileSizeBytes =
          Number.isFinite(fileSizeBytesRaw) && fileSizeBytesRaw > 0 ? Math.round(fileSizeBytesRaw) : 0
        const mimeType = normalizeText(raw.mimeType || raw.typeHint || raw.contentType)

        return {
          type: "file" as const,
          order: index,
          fileUrl,
          fileName,
          fileSizeBytes,
          mimeType: mimeType || undefined,
        }
      }

      return null
    })
    .filter((item): item is NormalizedResourceContentBlock => Boolean(item))
}

export function validateResourcePayload(input: {
  title: string
  description?: string
  content?: string
  tags: unknown
  images: unknown
  contentBlocks?: unknown
}): ResourcePayloadValidationResult {
  const title = input.title.trim()
  const descriptionRaw = (input.description || "").trim()

  if (title.length < RESOURCE_VALIDATION_LIMITS.titleMin || title.length > RESOURCE_VALIDATION_LIMITS.titleMax) {
    return {
      ok: false,
      error: `Title must be ${RESOURCE_VALIDATION_LIMITS.titleMin}-${RESOURCE_VALIDATION_LIMITS.titleMax} characters.`,
    }
  }

  if (descriptionRaw.length > RESOURCE_VALIDATION_LIMITS.descriptionMax) {
    return {
      ok: false,
      error: `Description must be at most ${RESOURCE_VALIDATION_LIMITS.descriptionMax} characters.`,
    }
  }

  const normalizedBlocks = normalizeContentBlocks(input.contentBlocks)
  if (normalizedBlocks.length === 0) {
    return {
      ok: false,
      error: "At least one content block is required.",
    }
  }

  if (normalizedBlocks.length > RESOURCE_VALIDATION_LIMITS.maxContentBlocks) {
    return {
      ok: false,
      error: `Too many content blocks. Maximum allowed is ${RESOURCE_VALIDATION_LIMITS.maxContentBlocks}.`,
    }
  }

  const contentBlocks: NormalizedResourceContentBlock[] = []

  if (normalizedBlocks.length > 0) {
    for (const block of normalizedBlocks) {
      if (block.type === "markdown") {
        if (!block.markdown) {
          return { ok: false, error: "Markdown block content is required." }
        }

        if (block.markdown.length > RESOURCE_VALIDATION_LIMITS.contentMax) {
          return {
            ok: false,
            error: `Markdown block content must be at most ${RESOURCE_VALIDATION_LIMITS.contentMax} characters.`,
          }
        }

        contentBlocks.push({
          type: "markdown",
          order: contentBlocks.length,
          markdown: block.markdown,
        })
        continue
      }

      if (block.type === "link") {
        if (!block.url) {
          return { ok: false, error: "Link block URL is required." }
        }

        if (block.url.length > RESOURCE_VALIDATION_LIMITS.maxUrlLength) {
          return {
            ok: false,
            error: `Link URL must be at most ${RESOURCE_VALIDATION_LIMITS.maxUrlLength} characters.`,
          }
        }

        if (!isValidHttpUrl(block.url)) {
          return { ok: false, error: "Link URL must be an absolute http(s) URL." }
        }

        const linkTitle = block.title || deriveLinkTitle(block.url)
        if (linkTitle.length > RESOURCE_VALIDATION_LIMITS.maxLinkTitleLength) {
          return {
            ok: false,
            error: `Link title must be at most ${RESOURCE_VALIDATION_LIMITS.maxLinkTitleLength} characters.`,
          }
        }

        if (block.previewImageUrl) {
          if (block.previewImageUrl.length > RESOURCE_VALIDATION_LIMITS.maxUrlLength) {
            return {
              ok: false,
              error: `Preview image URL must be at most ${RESOURCE_VALIDATION_LIMITS.maxUrlLength} characters.`,
            }
          }

          if (!isValidImageUrl(block.previewImageUrl)) {
            return {
              ok: false,
              error: "Preview image URL must be an absolute http(s) URL or a local /uploads/ path.",
            }
          }
        }

        contentBlocks.push({
          type: "link",
          order: contentBlocks.length,
          url: block.url,
          title: linkTitle,
          previewImageUrl: block.previewImageUrl,
        })
        continue
      }

      if (!block.fileUrl || !isValidImageUrl(block.fileUrl)) {
        return { ok: false, error: "File block URL must be an absolute http(s) URL or a local /uploads/ path." }
      }

      if (!block.fileName) {
        return { ok: false, error: "File block name is required." }
      }

      if (block.fileName.length > RESOURCE_VALIDATION_LIMITS.maxFileNameLength) {
        return {
          ok: false,
          error: `File name must be at most ${RESOURCE_VALIDATION_LIMITS.maxFileNameLength} characters.`,
        }
      }

      if (!Number.isFinite(block.fileSizeBytes) || block.fileSizeBytes <= 0) {
        return { ok: false, error: "File size must be greater than 0." }
      }

      if (block.fileSizeBytes > RESOURCE_VALIDATION_LIMITS.maxFileSizeBytes) {
        return {
          ok: false,
          error: `Each file must be <= ${Math.floor(RESOURCE_VALIDATION_LIMITS.maxFileSizeBytes / 1024 / 1024)}MB.`,
        }
      }

      contentBlocks.push({
        type: "file",
        order: contentBlocks.length,
        fileUrl: block.fileUrl,
        fileName: block.fileName,
        fileSizeBytes: block.fileSizeBytes,
        mimeType: block.mimeType,
      })
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
    if (image.url.length > RESOURCE_VALIDATION_LIMITS.maxUrlLength || !isValidImageUrl(image.url)) {
      return { ok: false, error: "Image URL must be an absolute http(s) URL or a local /uploads/ path." }
    }

    if (image.caption && image.caption.length > RESOURCE_VALIDATION_LIMITS.maxCaptionLength) {
      return {
        ok: false,
        error: `Image caption length must be at most ${RESOURCE_VALIDATION_LIMITS.maxCaptionLength} characters.`,
      }
    }
  }

  const contentFromBlocks = buildLegacyContentFromBlocks(contentBlocks)
  const content = contentFromBlocks.trim()

  if (!content || content.length > RESOURCE_VALIDATION_LIMITS.contentMax) {
    return {
      ok: false,
      error: "Content is required.",
    }
  }

  const description =
    descriptionRaw ||
    summarizeForDescription(content) ||
    `Resource: ${title}`

  return {
    ok: true,
    value: {
      title,
      description: description.slice(0, RESOURCE_VALIDATION_LIMITS.descriptionMax),
      content: "",
      tags,
      images,
      contentBlocks,
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

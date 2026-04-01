import type { DesignContentBlock } from "@/types/design"

export type RawContentBlockLike = {
  type: string
  order: number
  markdown?: string | null
  linkUrl?: string | null
  linkTitle?: string | null
  linkPreviewImage?: string | null
  fileUrl?: string | null
  fileName?: string | null
  fileSizeBytes?: number | null
  fileMimeType?: string | null
}

function normalizeText(input: string | null | undefined) {
  return (input || "").trim()
}

export function normalizeContentBlocks(blocks: RawContentBlockLike[]): DesignContentBlock[] {
  return blocks
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((block) => {
      const type = normalizeText(block.type).toLowerCase()
      if (type === "markdown") {
        const markdown = normalizeText(block.markdown)
        if (!markdown) return null
        return {
          type: "markdown" as const,
          order: block.order,
          markdown,
        }
      }

      if (type === "link") {
        const url = normalizeText(block.linkUrl)
        if (!url) return null
        const title = normalizeText(block.linkTitle) || url
        const previewImageUrl = normalizeText(block.linkPreviewImage) || undefined
        return {
          type: "link" as const,
          order: block.order,
          url,
          title,
          previewImageUrl,
        }
      }

      if (type === "file") {
        const fileUrl = normalizeText(block.fileUrl)
        const fileName = normalizeText(block.fileName)
        const fileSizeBytes = typeof block.fileSizeBytes === "number" ? block.fileSizeBytes : 0
        if (!fileUrl || !fileName || fileSizeBytes <= 0) return null
        return {
          type: "file" as const,
          order: block.order,
          fileUrl,
          fileName,
          fileSizeBytes,
          mimeType: normalizeText(block.fileMimeType) || undefined,
        }
      }

      return null
    })
    .filter((item): item is DesignContentBlock => Boolean(item))
}

export function contentBlocksToSearchText(blocks: DesignContentBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "markdown") return block.markdown
      if (block.type === "link") return `${block.title} ${block.url}`
      return `${block.fileName} ${block.fileUrl}`
    })
    .join(" ")
    .trim()
}

export function contentBlocksToPlainText(blocks: DesignContentBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === "markdown") return block.markdown
      if (block.type === "link") return `${block.title}\n${block.url}`
      return `${block.fileName}\n${block.fileUrl}`
    })
    .join("\n\n")
    .trim()
}

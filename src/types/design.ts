export type Tone = "sky" | "peach" | "mint" | "ink"

export type DesignSummary = {
  id: string
  slug: string
  title: string
  description: string
  author: {
    name: string
    handle: string
  }
  tags: string[]
  image?: string
  stats: {
    comments: number
    ratings: number
    averageRating: number
  }
  tone: Tone
}

export type DesignContentBlock =
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

export type DesignDetail = DesignSummary & {
  contentBlocks: DesignContentBlock[]
  images: { url: string; caption?: string }[]
  createdAt: Date
  updatedAt: Date
}

export type Topic = {
  slug: string
  title: string
  description: string | null
  count: number
  tone: Tone
}

export type AuthorProfile = {
  id: string
  name: string
  handle: string
  bio: string | null
  stats: {
    designs: number
    comments: number
    ratings: number
  }
}

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

export type DesignDetail = DesignSummary & {
  content: string
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

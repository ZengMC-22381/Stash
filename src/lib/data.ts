import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { localizeTopic, type Locale } from "@/lib/locale"
import { toneFromString } from "@/lib/tone"
import type { AuthorProfile, DesignDetail, DesignSummary, Topic } from "@/types/design"

type DesignSummaryRow = Prisma.DesignGetPayload<{
  include: {
    author: { select: { id: true; name: true; handle: true } }
    tags: { include: { tag: true } }
    images: true
    _count: { select: { comments: true; ratings: true } }
  }
}>

type GetDesignSummariesOptions = {
  search?: string
}

export type ForumThread = {
  id: string
  content: string
  createdAt: Date
  author: {
    name: string
    handle: string
  }
  design: {
    slug: string
    title: string
  }
}

async function getRatingStats(ids: string[]) {
  if (ids.length === 0) return new Map<string, { avg: number; count: number }>()

  const stats = await prisma.rating.groupBy({
    by: ["designId"],
    where: { designId: { in: ids } },
    _avg: { value: true },
    _count: { _all: true },
  })

  return new Map(
    stats.map((stat) => [stat.designId, { avg: stat._avg.value ?? 0, count: stat._count._all }])
  )
}

function mapDesignSummary(
  design: DesignSummaryRow,
  ratingMap: Map<string, { avg: number; count: number }>
): DesignSummary {
  const rating = ratingMap.get(design.id)
  return {
    id: design.id,
    slug: design.slug,
    title: design.title,
    description: design.description,
    author: {
      name: design.author.name,
      handle: design.author.handle,
    },
    tags: design.tags.map((entry) => entry.tag.name),
    image: design.images[0]?.url,
    stats: {
      comments: design._count.comments,
      ratings: rating?.count ?? 0,
      averageRating: rating?.avg ?? 0,
    },
    tone: toneFromString(design.slug),
  }
}

export async function getFeaturedDesigns(limit = 6): Promise<DesignSummary[]> {
  const designs = await prisma.design.findMany({
    take: limit,
    orderBy: { ratings: { _count: "desc" } },
    include: {
      author: { select: { id: true, name: true, handle: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  const ratingMap = await getRatingStats(designs.map((design) => design.id))
  return designs.map((design) => mapDesignSummary(design, ratingMap))
}

export async function getDesignSummaries(
  limit = 12,
  options: GetDesignSummariesOptions = {}
): Promise<DesignSummary[]> {
  const search = options.search?.trim()
  const where: Prisma.DesignWhereInput | undefined = search
    ? {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { content: { contains: search } },
        ],
      }
    : undefined

  const designs = await prisma.design.findMany({
    where,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, handle: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  const ratingMap = await getRatingStats(designs.map((design) => design.id))
  return designs.map((design) => mapDesignSummary(design, ratingMap))
}

export async function getForumThreads(limit = 24): Promise<ForumThread[]> {
  const comments = await prisma.comment.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, handle: true } },
      design: { select: { slug: true, title: true } },
    },
  })

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: {
      name: comment.author.name,
      handle: comment.author.handle,
    },
    design: {
      slug: comment.design.slug,
      title: comment.design.title,
    },
  }))
}

export async function getDesignDetail(slug: string): Promise<DesignDetail | null> {
  const design = await prisma.design.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, handle: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  if (!design) return null

  const rating = await prisma.rating.aggregate({
    where: { designId: design.id },
    _avg: { value: true },
    _count: { _all: true },
  })

  return {
    id: design.id,
    slug: design.slug,
    title: design.title,
    description: design.description,
    content: design.content,
    author: {
      name: design.author.name,
      handle: design.author.handle,
    },
    tags: design.tags.map((entry) => entry.tag.name),
    image: design.images[0]?.url,
    images: design.images.map((image) => ({ url: image.url, caption: image.caption || undefined })),
    stats: {
      comments: design._count.comments,
      ratings: rating._count._all,
      averageRating: rating._avg.value ?? 0,
    },
    tone: toneFromString(design.slug),
    createdAt: design.createdAt,
    updatedAt: design.updatedAt,
  }
}

export async function getTopics(locale: Locale = "zh"): Promise<Topic[]> {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { designs: true } } },
    orderBy: { name: "asc" },
  })

  return categories.map((category) => {
    const localized = localizeTopic(category.slug, locale, category.name, category.description)
    return {
      slug: category.slug,
      title: localized.title,
      description: localized.description,
      count: category._count.designs,
      tone: toneFromString(category.slug),
    }
  })
}

export async function getAuthorProfile(idOrHandle: string): Promise<AuthorProfile | null> {
  const author = await prisma.user.findFirst({
    where: {
      OR: [{ id: idOrHandle }, { handle: idOrHandle }],
    },
  })

  if (!author) return null

  const [designs, comments, ratings] = await Promise.all([
    prisma.design.count({ where: { authorId: author.id } }),
    prisma.comment.count({ where: { authorId: author.id } }),
    prisma.rating.count({ where: { authorId: author.id } }),
  ])

  return {
    id: author.id,
    name: author.name,
    handle: author.handle,
    bio: null,
    stats: {
      designs,
      comments,
      ratings,
    },
  }
}

export async function getDesignsByAuthor(authorId: string): Promise<DesignSummary[]> {
  const designs = await prisma.design.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, handle: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  const ratingMap = await getRatingStats(designs.map((design) => design.id))
  return designs.map((design) => mapDesignSummary(design, ratingMap))
}

export async function getRelatedDesigns(slug: string, limit = 3): Promise<DesignSummary[]> {
  const design = await prisma.design.findUnique({
    where: { slug },
    select: { id: true, categoryId: true },
  })

  if (!design) return []

  const designs = await prisma.design.findMany({
    where: {
      id: { not: design.id },
      categoryId: design.categoryId || undefined,
    },
    take: limit,
    include: {
      author: { select: { id: true, name: true, handle: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  const ratingMap = await getRatingStats(designs.map((item) => item.id))
  return designs.map((item) => mapDesignSummary(item, ratingMap))
}

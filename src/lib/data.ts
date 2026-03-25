import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { localizeTopic, type Locale } from "@/lib/locale"
import { matchesDerivedFacetFilters } from "@/lib/search-facets"
import { toneFromString } from "@/lib/tone"
import type { AuthorProfile, Topic } from "@/types/design"
import type { ResourceDetail, ResourceSummary } from "@/types/resource"

type ResourceSummaryRow = Prisma.DesignGetPayload<{
  include: {
    author: { select: { id: true; name: true; handle: true } }
    category: { select: { slug: true } }
    tags: { include: { tag: true } }
    images: true
    _count: { select: { comments: true; ratings: true } }
  }
}>

type GetResourceSummariesOptions = {
  search?: string
  typeSlugs?: string[]
  styleSlugs?: string[]
  frameworkSlugs?: string[]
  fontSlugs?: string[]
  platformSlugs?: string[]
}

export type ForumThread = {
  id: string
  content: string
  createdAt: Date
  author: {
    name: string
    handle: string
  }
  resource: {
    slug: string
    title: string
  }
}

export type HomeHeroStats = {
  todayCopyCount: number
  contributorCount: number
}

function getTodayRange(now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
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

function mapResourceSummary(
  resource: ResourceSummaryRow,
  ratingMap: Map<string, { avg: number; count: number }>
): ResourceSummary {
  const rating = ratingMap.get(resource.id)
  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    resourceType: resource.resourceType,
    toolAgent: resource.toolAgent,
    scenario: resource.scenario,
    author: {
      name: resource.author.name,
      handle: resource.author.handle,
    },
    tags: resource.tags.map((entry) => entry.tag.name),
    image: resource.images[0]?.url,
    stats: {
      comments: resource._count.comments,
      ratings: rating?.count ?? 0,
      averageRating: rating?.avg ?? 0,
    },
    tone: toneFromString(resource.slug),
  }
}

export async function getFeaturedResources(limit = 6): Promise<ResourceSummary[]> {
  const resources = await prisma.design.findMany({
    take: limit,
    orderBy: { ratings: { _count: "desc" } },
    include: {
      author: { select: { id: true, name: true, handle: true } },
      category: { select: { slug: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  const ratingMap = await getRatingStats(resources.map((resource) => resource.id))
  return resources.map((resource) => mapResourceSummary(resource, ratingMap))
}

export async function getResourceSummaries(
  limit = 12,
  options: GetResourceSummariesOptions = {}
): Promise<ResourceSummary[]> {
  const search = options.search?.trim()
  const normalizedTypeSlugs = Array.from(
    new Set((options.typeSlugs || []).map((item) => item.trim()).filter(Boolean))
  )
  const normalizedStyleSlugs = Array.from(
    new Set((options.styleSlugs || []).map((item) => item.trim().toLowerCase()).filter(Boolean))
  )
  const normalizedFrameworkSlugs = Array.from(
    new Set((options.frameworkSlugs || []).map((item) => item.trim().toLowerCase()).filter(Boolean))
  )
  const normalizedFontSlugs = Array.from(
    new Set((options.fontSlugs || []).map((item) => item.trim().toLowerCase()).filter(Boolean))
  )
  const normalizedPlatformSlugs = Array.from(
    new Set((options.platformSlugs || []).map((item) => item.trim().toLowerCase()).filter(Boolean))
  )

  const whereClauses: Prisma.DesignWhereInput[] = []

  if (search) {
    whereClauses.push({
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
        { content: { contains: search } },
      ],
    })
  }

  if (normalizedTypeSlugs.length > 0) {
    whereClauses.push({
      category: {
        slug: {
          in: normalizedTypeSlugs,
        },
      },
    })
  }

  const where: Prisma.DesignWhereInput | undefined =
    whereClauses.length === 0 ? undefined : whereClauses.length === 1 ? whereClauses[0] : { AND: whereClauses }

  const hasDerivedFacetFilters =
    normalizedStyleSlugs.length > 0 ||
    normalizedFrameworkSlugs.length > 0 ||
    normalizedFontSlugs.length > 0 ||
    normalizedPlatformSlugs.length > 0

  const resources = await prisma.design.findMany({
    where,
    take: hasDerivedFacetFilters ? undefined : limit,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, handle: true } },
      category: { select: { slug: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  const filteredResources = hasDerivedFacetFilters
    ? resources
        .filter((resource) =>
          matchesDerivedFacetFilters(
            {
              title: resource.title,
              description: resource.description,
              content: resource.content,
              categorySlug: resource.category?.slug,
              tags: resource.tags.map((entry) => ({ slug: entry.tag.slug, name: entry.tag.name })),
            },
            {
              styles: normalizedStyleSlugs,
              frameworks: normalizedFrameworkSlugs,
              fonts: normalizedFontSlugs,
              platforms: normalizedPlatformSlugs,
            }
          )
        )
        .slice(0, limit)
    : resources

  const ratingMap = await getRatingStats(filteredResources.map((resource) => resource.id))
  return filteredResources.map((resource) => mapResourceSummary(resource, ratingMap))
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
    resource: {
      slug: comment.design.slug,
      title: comment.design.title,
    },
  }))
}

export async function getResourceDetail(slug: string): Promise<ResourceDetail | null> {
  const resource = await prisma.design.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, handle: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  if (!resource) return null

  const rating = await prisma.rating.aggregate({
    where: { designId: resource.id },
    _avg: { value: true },
    _count: { _all: true },
  })

  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    content: resource.content,
    resourceType: resource.resourceType,
    toolAgent: resource.toolAgent,
    scenario: resource.scenario,
    author: {
      name: resource.author.name,
      handle: resource.author.handle,
    },
    tags: resource.tags.map((entry) => entry.tag.name),
    image: resource.images[0]?.url,
    images: resource.images.map((image) => ({ url: image.url, caption: image.caption || undefined })),
    stats: {
      comments: resource._count.comments,
      ratings: rating._count._all,
      averageRating: rating._avg.value ?? 0,
    },
    tone: toneFromString(resource.slug),
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
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

export async function getResourcesByAuthor(authorId: string): Promise<ResourceSummary[]> {
  const resources = await prisma.design.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, handle: true } },
      category: { select: { slug: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  const ratingMap = await getRatingStats(resources.map((resource) => resource.id))
  return resources.map((resource) => mapResourceSummary(resource, ratingMap))
}

export async function getRelatedResources(slug: string, limit = 3): Promise<ResourceSummary[]> {
  const resource = await prisma.design.findUnique({
    where: { slug },
    select: { id: true, categoryId: true },
  })

  if (!resource) return []

  const resources = await prisma.design.findMany({
    where: {
      id: { not: resource.id },
      categoryId: resource.categoryId || undefined,
    },
    take: limit,
    include: {
      author: { select: { id: true, name: true, handle: true } },
      category: { select: { slug: true } },
      tags: { include: { tag: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { comments: true, ratings: true } },
    },
  })

  const ratingMap = await getRatingStats(resources.map((item) => item.id))
  return resources.map((item) => mapResourceSummary(item, ratingMap))
}

// Backward-compatible exports while Resource naming is adopted incrementally.
export const getFeaturedDesigns = getFeaturedResources
export const getDesignSummaries = getResourceSummaries
export const getDesignDetail = getResourceDetail
export const getDesignsByAuthor = getResourcesByAuthor
export const getRelatedDesigns = getRelatedResources

export async function getHomeHeroStats(): Promise<HomeHeroStats> {
  const { start, end } = getTodayRange()

  const [todayCopyCount, contributorCount] = await Promise.all([
    prisma.copyEvent.count({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.user.count(),
  ])

  return {
    todayCopyCount,
    contributorCount,
  }
}

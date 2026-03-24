import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"
import { ensureUniqueSlug, slugify } from "@/lib/slug"

export const runtime = "nodejs"

function normalizeTags(input: unknown) {
  if (Array.isArray(input)) {
    return input.map((tag) => String(tag).trim()).filter(Boolean)
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeImages(input: unknown) {
  if (!Array.isArray(input)) return []
  return input
    .map((item, index) => {
      if (typeof item === "string") {
        return { url: item, order: index }
      }
      if (item && typeof item === "object" && "url" in item) {
        const typed = item as { url: string; caption?: string; order?: number }
        return {
          url: String(typed.url),
          caption: typed.caption ? String(typed.caption) : undefined,
          order: typeof typed.order === "number" ? typed.order : index,
        }
      }
      return null
    })
    .filter((item): item is { url: string; caption?: string; order: number } => Boolean(item && item.url))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim()
    const category = searchParams.get("category")?.trim()
    const sort = searchParams.get("sort")?.trim() || "latest"
    const takeParam = Number(searchParams.get("take"))
    const skipParam = Number(searchParams.get("skip"))
    const take = Number.isFinite(takeParam) && takeParam > 0 ? Math.min(takeParam, 100) : 24
    const skip = Number.isFinite(skipParam) && skipParam >= 0 ? skipParam : 0

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = { slug: category }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    const orderBy =
      sort === "popular"
        ? { ratings: { _count: "desc" as const } }
        : sort === "trending"
          ? { comments: { _count: "desc" as const } }
          : { createdAt: "desc" as const }

    const designs = await prisma.design.findMany({
      where,
      take,
      skip,
      orderBy,
      include: {
        author: { select: { id: true, name: true, handle: true } },
        category: true,
        tags: { include: { tag: true } },
        images: { orderBy: { order: "asc" } },
        _count: { select: { comments: true, ratings: true } },
      },
    })

    const ids = designs.map((design) => design.id)
    const ratingStats = await prisma.rating.groupBy({
      by: ["designId"],
      where: { designId: { in: ids } },
      _avg: { value: true },
      _count: { _all: true },
    })

    const ratingMap = new Map(
      ratingStats.map((stat) => [stat.designId, { avg: stat._avg.value ?? 0, count: stat._count._all }])
    )

    const payload = designs.map((design) => {
      const rating = ratingMap.get(design.id)
      return {
        id: design.id,
        slug: design.slug,
        title: design.title,
        description: design.description,
        author: design.author,
        category: design.category,
        tags: design.tags.map((entry) => entry.tag),
        images: design.images,
        stats: {
          comments: design._count.comments,
          ratings: rating?.count ?? 0,
          averageRating: rating?.avg ?? 0,
        },
        createdAt: design.createdAt,
        updatedAt: design.updatedAt,
      }
    })

    return NextResponse.json({ designs: payload })
  } catch (error) {
    console.error("[DESIGNS_GET]", error)
    return NextResponse.json({ error: "Failed to load designs." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const body = await request.json()
    const title = String(body.title || "").trim()
    const description = String(body.description || "").trim()
    const content = String(body.content || "").trim()

    if (!title || !description || !content) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    const tags = normalizeTags(body.tags)
    const images = normalizeImages(body.images)

    let categoryId: string | undefined

    if (body.categoryId) {
      categoryId = String(body.categoryId)
    } else if (body.categorySlug || body.categoryName || body.category) {
      const name = String(body.categoryName || body.category || body.categorySlug).trim()
      const slug = slugify(body.categorySlug || name)
      if (slug) {
        const category = await prisma.category.upsert({
          where: { slug },
          create: { name, slug },
          update: { name },
        })
        categoryId = category.id
      }
    }

    const slug = await ensureUniqueSlug(title, async (candidate) => {
      const existing = await prisma.design.findUnique({ where: { slug: candidate } })
      return Boolean(existing)
    })

    const design = await prisma.design.create({
      data: {
        title,
        description,
        content,
        slug,
        authorId: userId,
        categoryId,
        tags: {
          create: tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { slug: slugify(tag) },
                create: { name: tag, slug: slugify(tag) },
              },
            },
          })),
        },
        images: {
          create: images.map((image) => ({
            url: image.url,
            caption: image.caption,
            order: image.order,
          })),
        },
      },
      include: {
        author: { select: { id: true, name: true, handle: true } },
        category: true,
        tags: { include: { tag: true } },
        images: { orderBy: { order: "asc" } },
      },
    })

    return NextResponse.json({ design })
  } catch (error) {
    console.error("[DESIGNS_POST]", error)
    return NextResponse.json({ error: "Failed to create design." }, { status: 500 })
  }
}

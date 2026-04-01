import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { RATE_LIMIT_RULES } from "@/lib/rate-limit-rules"
import {
  DEFAULT_RESOURCE_TYPE,
  RESOURCE_TAG_OPTIONS,
  RESOURCE_SCENARIO_OPTIONS,
  RESOURCE_TOOL_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
  resolveDictionaryOption,
} from "@/lib/resource-definition"
import { validateResourcePayload } from "@/lib/resource-validation"
import { ensureUniqueSlug, slugify } from "@/lib/slug"

export const runtime = "nodejs"

function parseMultiParam(searchParams: URLSearchParams, key: string) {
  const raw = searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean)

  return Array.from(new Set(raw))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim()
    const category = searchParams.get("category")?.trim()
    const resourceTypeValues = parseMultiParam(searchParams, "resourceType")
    const toolValues = parseMultiParam(searchParams, "tool")
    const tagValues = parseMultiParam(searchParams, "tag")
    const scenarioValues = parseMultiParam(searchParams, "scenario")
    const sort = searchParams.get("sort")?.trim() || "latest"
    const takeParam = Number(searchParams.get("take"))
    const skipParam = Number(searchParams.get("skip"))
    const take = Number.isFinite(takeParam) && takeParam > 0 ? Math.min(takeParam, 100) : 24
    const skip = Number.isFinite(skipParam) && skipParam >= 0 ? skipParam : 0

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = { slug: category }
    }

    if (resourceTypeValues.length > 0) {
      const normalizedTypes = Array.from(
        new Set(
          resourceTypeValues
            .map((value) => resolveDictionaryOption(value, RESOURCE_TYPE_OPTIONS)?.value || value.trim().toLowerCase())
            .filter(Boolean)
        )
      )
      if (normalizedTypes.length > 0) {
        where.resourceType = { in: normalizedTypes }
      }
    }

    if (toolValues.length > 0) {
      const normalizedTools = Array.from(
        new Set(
          toolValues
            .map((value) => resolveDictionaryOption(value, RESOURCE_TOOL_OPTIONS)?.label || value.trim())
            .filter(Boolean)
        )
      )
      if (normalizedTools.length > 0) {
        where.toolAgent = { in: normalizedTools }
      }
    }

    if (tagValues.length > 0) {
      const tagSlugs = Array.from(
        new Set(
          tagValues
            .map((value) => resolveDictionaryOption(value, RESOURCE_TAG_OPTIONS)?.value || slugify(value))
            .filter(Boolean)
        )
      )
      if (tagSlugs.length > 0) {
        where.tags = {
          some: {
            tag: {
              slug: {
                in: tagSlugs,
              },
            },
          },
        }
      }
    }

    if (scenarioValues.length > 0) {
      const normalizedScenarios = Array.from(
        new Set(
          scenarioValues
            .map((value) => resolveDictionaryOption(value, RESOURCE_SCENARIO_OPTIONS)?.label || value.trim())
            .filter(Boolean)
        )
      )
      if (normalizedScenarios.length > 0) {
        where.scenario = {
          in: normalizedScenarios,
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          contentBlocks: {
            some: {
              OR: [
                { markdown: { contains: search, mode: "insensitive" } },
                { linkTitle: { contains: search, mode: "insensitive" } },
                { linkUrl: { contains: search, mode: "insensitive" } },
                { fileName: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ]
    }

    const normalizedSort = sort.toLowerCase()
    const orderBy =
      normalizedSort === "popular"
        ? { copyEvents: { _count: "desc" as const } }
        : normalizedSort === "liked" || normalizedSort === "top-liked"
          ? { likes: { _count: "desc" as const } }
          : normalizedSort === "trending"
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
        _count: { select: { comments: true, ratings: true, likes: true, copyEvents: true } },
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
        resourceType: design.resourceType,
        toolAgent: design.toolAgent,
        scenario: design.scenario,
        author: design.author,
        category: design.category,
        tags: design.tags.map((entry) => entry.tag),
        images: design.images,
        stats: {
          comments: design._count.comments,
          ratings: rating?.count ?? 0,
          averageRating: rating?.avg ?? 0,
          likes: design._count.likes,
          views: design._count.copyEvents,
        },
        createdAt: design.createdAt,
        updatedAt: design.updatedAt,
      }
    })

    return NextResponse.json({ resources: payload, designs: payload })
  } catch (error) {
    console.error("[DESIGNS_GET]", error)
    return NextResponse.json({ error: "Failed to load resources." }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const rateLimit = enforceRateLimit(request, RATE_LIMIT_RULES.resourceCreate, userId)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many resource submissions. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const body = await request.json()
    const payload = validateResourcePayload({
      title: String(body.title || ""),
      description: String(body.description || ""),
      tags: body.tags,
      images: body.images,
      contentBlocks: body.contentBlocks ?? body.blocks,
    })
    if (!payload.ok) {
      return NextResponse.json({ error: payload.error }, { status: 400 })
    }

    const { title, description, tags, images, contentBlocks } = payload.value
    const inputResourceType = body.resourceType ?? body.type
    const typeOption = inputResourceType
      ? resolveDictionaryOption(inputResourceType, RESOURCE_TYPE_OPTIONS)
      : resolveDictionaryOption(DEFAULT_RESOURCE_TYPE, RESOURCE_TYPE_OPTIONS)
    const toolOption = resolveDictionaryOption(body.toolAgent || body.tool, RESOURCE_TOOL_OPTIONS)
    const scenarioOption = resolveDictionaryOption(body.scenario, RESOURCE_SCENARIO_OPTIONS)

    if (inputResourceType && !typeOption) {
      return NextResponse.json({ error: "Invalid resource type." }, { status: 400 })
    }

    if ((body.toolAgent || body.tool) && !toolOption) {
      return NextResponse.json({ error: "Invalid tool/agent." }, { status: 400 })
    }

    if (body.scenario && !scenarioOption) {
      return NextResponse.json({ error: "Invalid scenario." }, { status: 400 })
    }

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

    const resource = await prisma.design.create({
      data: {
        title,
        description,
        content: "",
        slug,
        resourceType: typeOption?.value || DEFAULT_RESOURCE_TYPE,
        toolAgent: toolOption?.label || null,
        scenario: scenarioOption?.label || null,
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
        contentBlocks: {
          create: contentBlocks.map((block) => {
            if (block.type === "markdown") {
              return {
                type: block.type,
                order: block.order,
                markdown: block.markdown,
              }
            }

            if (block.type === "link") {
              return {
                type: block.type,
                order: block.order,
                linkUrl: block.url,
                linkTitle: block.title,
                linkPreviewImage: block.previewImageUrl,
              }
            }

            return {
              type: block.type,
              order: block.order,
              fileUrl: block.fileUrl,
              fileName: block.fileName,
              fileSizeBytes: block.fileSizeBytes,
              fileMimeType: block.mimeType,
            }
          }),
        },
      },
      include: {
        author: { select: { id: true, name: true, handle: true } },
        category: true,
        tags: { include: { tag: true } },
        images: { orderBy: { order: "asc" } },
        contentBlocks: { orderBy: { order: "asc" } },
        _count: { select: { comments: true, ratings: true, likes: true } },
      },
    })

    return NextResponse.json({ resource, design: resource })
  } catch (error) {
    console.error("[DESIGNS_POST]", error)
    return NextResponse.json({ error: "Failed to create resource." }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { RATE_LIMIT_RULES } from "@/lib/rate-limit-rules"
import { ensureUniqueSlug } from "@/lib/slug"

export const runtime = "nodejs"

type RouteProps = {
  params: Promise<{ slug: string }>
}

export async function POST(request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const rateLimit = enforceRateLimit(request, RATE_LIMIT_RULES.remixCreate, userId)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many remix attempts. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const baseDesign = await prisma.design.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true } },
        tags: { include: { tag: true } },
        images: true,
      },
    })

    if (!baseDesign) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const titleInput = typeof body.title === "string" ? body.title.trim() : ""
    const descriptionInput = typeof body.description === "string" ? body.description.trim() : ""
    const contentInput = typeof body.content === "string" ? body.content.trim() : ""

    if (titleInput.length > 120) {
      return NextResponse.json({ error: "Remix title is too long." }, { status: 400 })
    }

    if (descriptionInput.length > 500) {
      return NextResponse.json({ error: "Remix description is too long." }, { status: 400 })
    }

    if (contentInput.length > 50_000) {
      return NextResponse.json({ error: "Remix content is too long." }, { status: 400 })
    }

    const title = titleInput || `${baseDesign.title} Remix`
    const description =
      descriptionInput || `Remix of \"${baseDesign.title}\" by ${baseDesign.author.name}.`
    const content = contentInput || baseDesign.content

    const remixSlug = await ensureUniqueSlug(title, async (candidate) => {
      const existing = await prisma.design.findUnique({ where: { slug: candidate } })
      return Boolean(existing)
    })

    const remix = await prisma.design.create({
      data: {
        title,
        slug: remixSlug,
        description,
        content,
        authorId: userId,
        parentDesignId: baseDesign.id,
        categoryId: baseDesign.categoryId,
        resourceType: baseDesign.resourceType,
        toolAgent: baseDesign.toolAgent,
        scenario: baseDesign.scenario,
        tags: {
          create: baseDesign.tags.map((entry) => ({
            tag: { connect: { id: entry.tagId ?? entry.tag.id } },
          })),
        },
        images: {
          create: baseDesign.images.map((image) => ({
            url: image.url,
            caption: image.caption,
            order: image.order,
          })),
        },
      },
      select: { id: true, slug: true, title: true },
    })

    return NextResponse.json({ resource: remix, design: remix })
  } catch (error) {
    console.error("[REMIX_POST]", error)
    return NextResponse.json({ error: "Failed to remix resource." }, { status: 500 })
  }
}

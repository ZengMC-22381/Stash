import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type RouteProps = {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const design = await prisma.design.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, handle: true } },
        category: true,
        tags: { include: { tag: true } },
        images: { orderBy: { order: "asc" } },
        _count: { select: { comments: true, ratings: true, likes: true } },
      },
    })

    if (!design) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 })
    }

    const rating = await prisma.rating.aggregate({
      where: { designId: design.id },
      _avg: { value: true },
      _count: { _all: true },
    })

    const payload = {
      id: design.id,
      slug: design.slug,
      title: design.title,
      description: design.description,
      content: design.content,
      resourceType: design.resourceType,
      toolAgent: design.toolAgent,
      scenario: design.scenario,
      author: design.author,
      category: design.category,
      tags: design.tags.map((entry) => entry.tag),
      images: design.images,
      stats: {
        comments: design._count.comments,
        ratings: rating._count._all,
        averageRating: rating._avg.value ?? 0,
        likes: design._count.likes,
      },
      createdAt: design.createdAt,
      updatedAt: design.updatedAt,
    }

    return NextResponse.json({ design: payload })
  } catch (error) {
    console.error("[DESIGN_GET]", error)
    return NextResponse.json({ error: "Failed to load design." }, { status: 500 })
  }
}

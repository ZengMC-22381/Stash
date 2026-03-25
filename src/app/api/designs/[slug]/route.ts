import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

type RouteProps = {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const resource = await prisma.design.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, handle: true } },
        category: true,
        tags: { include: { tag: true } },
        images: { orderBy: { order: "asc" } },
        _count: { select: { comments: true, ratings: true, likes: true } },
      },
    })

    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    const rating = await prisma.rating.aggregate({
      where: { designId: resource.id },
      _avg: { value: true },
      _count: { _all: true },
    })

    const payload = {
      id: resource.id,
      slug: resource.slug,
      title: resource.title,
      description: resource.description,
      content: resource.content,
      resourceType: resource.resourceType,
      toolAgent: resource.toolAgent,
      scenario: resource.scenario,
      author: resource.author,
      category: resource.category,
      tags: resource.tags.map((entry) => entry.tag),
      images: resource.images,
      stats: {
        comments: resource._count.comments,
        ratings: rating._count._all,
        averageRating: rating._avg.value ?? 0,
        likes: resource._count.likes,
      },
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    }

    return NextResponse.json({ resource: payload, design: payload })
  } catch (error) {
    console.error("[DESIGN_GET]", error)
    return NextResponse.json({ error: "Failed to load resource." }, { status: 500 })
  }
}

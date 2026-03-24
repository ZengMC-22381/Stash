import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

type RouteProps = {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const design = await prisma.design.findUnique({ where: { slug } })
    if (!design) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 })
    }

    const comments = await prisma.comment.findMany({
      where: { designId: design.id },
      include: { author: { select: { id: true, name: true, handle: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("[COMMENTS_GET]", error)
    return NextResponse.json({ error: "Failed to load comments." }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const design = await prisma.design.findUnique({ where: { slug } })
    if (!design) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 })
    }

    const body = await request.json()
    const content = String(body.content || "").trim()
    if (!content) {
      return NextResponse.json({ error: "Content is required." }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        designId: design.id,
        authorId: userId,
      },
      include: { author: { select: { id: true, name: true, handle: true } } },
    })

    return NextResponse.json({ comment })
  } catch (error) {
    console.error("[COMMENTS_POST]", error)
    return NextResponse.json({ error: "Failed to post comment." }, { status: 500 })
  }
}

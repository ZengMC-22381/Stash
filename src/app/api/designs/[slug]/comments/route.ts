import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { RATE_LIMIT_RULES } from "@/lib/rate-limit-rules"
import { validateCommentContent } from "@/lib/resource-validation"

export const runtime = "nodejs"

type RouteProps = {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const resource = await prisma.design.findUnique({ where: { slug } })
    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    const comments = await prisma.comment.findMany({
      where: { designId: resource.id },
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

    const rateLimit = enforceRateLimit(request, RATE_LIMIT_RULES.commentCreate, userId)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many comments. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const resource = await prisma.design.findUnique({ where: { slug } })
    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    const body = await request.json()
    const contentValidation = validateCommentContent(body.content)
    if (!contentValidation.ok) {
      return NextResponse.json({ error: contentValidation.error }, { status: 400 })
    }
    const content = contentValidation.value

    const comment = await prisma.comment.create({
      data: {
        content,
        designId: resource.id,
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

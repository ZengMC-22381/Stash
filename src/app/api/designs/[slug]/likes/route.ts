import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { RATE_LIMIT_RULES } from "@/lib/rate-limit-rules"

export const runtime = "nodejs"

type RouteProps = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const resource = await prisma.design.findUnique({ where: { slug } })
    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    const [total, userId] = await Promise.all([
      prisma.like.count({ where: { designId: resource.id } }),
      getUserIdFromRequest(request),
    ])

    let liked = false
    if (userId) {
      const existing = await prisma.like.findUnique({
        where: { designId_userId: { designId: resource.id, userId } },
        select: { id: true },
      })
      liked = Boolean(existing)
    }

    return NextResponse.json({ liked, total })
  } catch (error) {
    console.error("[LIKES_GET]", error)
    return NextResponse.json({ error: "Failed to load like state." }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const rateLimit = enforceRateLimit(request, RATE_LIMIT_RULES.interactionWrite, userId)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many like actions. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const resource = await prisma.design.findUnique({ where: { slug } })
    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    await prisma.like.upsert({
      where: { designId_userId: { designId: resource.id, userId } },
      update: {},
      create: { designId: resource.id, userId },
    })

    const total = await prisma.like.count({ where: { designId: resource.id } })
    return NextResponse.json({ liked: true, total })
  } catch (error) {
    console.error("[LIKES_POST]", error)
    return NextResponse.json({ error: "Failed to like resource." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const rateLimit = enforceRateLimit(request, RATE_LIMIT_RULES.interactionWrite, userId)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many like actions. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const resource = await prisma.design.findUnique({ where: { slug } })
    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    await prisma.like.deleteMany({ where: { designId: resource.id, userId } })

    const total = await prisma.like.count({ where: { designId: resource.id } })
    return NextResponse.json({ liked: false, total })
  } catch (error) {
    console.error("[LIKES_DELETE]", error)
    return NextResponse.json({ error: "Failed to unlike resource." }, { status: 500 })
  }
}

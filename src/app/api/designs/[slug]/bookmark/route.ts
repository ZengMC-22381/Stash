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
      prisma.bookmark.count({ where: { designId: resource.id } }),
      getUserIdFromRequest(request),
    ])

    let saved = false
    if (userId) {
      const existing = await prisma.bookmark.findUnique({
        where: { designId_userId: { designId: resource.id, userId } },
        select: { id: true },
      })
      saved = Boolean(existing)
    }

    return NextResponse.json({ saved, total })
  } catch (error) {
    console.error("[BOOKMARK_GET]", error)
    return NextResponse.json({ error: "Failed to load bookmark state." }, { status: 500 })
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
      return NextResponse.json({ error: "Too many bookmark actions. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const resource = await prisma.design.findUnique({ where: { slug } })
    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    await prisma.bookmark.upsert({
      where: { designId_userId: { designId: resource.id, userId } },
      update: {},
      create: { designId: resource.id, userId },
    })

    const total = await prisma.bookmark.count({ where: { designId: resource.id } })
    return NextResponse.json({ saved: true, total })
  } catch (error) {
    console.error("[BOOKMARK_POST]", error)
    return NextResponse.json({ error: "Failed to save bookmark." }, { status: 500 })
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
      return NextResponse.json({ error: "Too many bookmark actions. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const resource = await prisma.design.findUnique({ where: { slug } })
    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 })
    }

    await prisma.bookmark.deleteMany({ where: { designId: resource.id, userId } })

    const total = await prisma.bookmark.count({ where: { designId: resource.id } })
    return NextResponse.json({ saved: false, total })
  } catch (error) {
    console.error("[BOOKMARK_DELETE]", error)
    return NextResponse.json({ error: "Failed to remove bookmark." }, { status: 500 })
  }
}

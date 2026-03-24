import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

type RouteProps = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteProps) {
  try {
    const { slug } = await context.params
    const design = await prisma.design.findUnique({ where: { slug } })
    if (!design) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 })
    }

    const userId = await getUserIdFromRequest(request)

    const rating = await prisma.rating.aggregate({
      where: { designId: design.id },
      _avg: { value: true },
      _count: { _all: true },
    })

    let myRating: number | null = null
    if (userId) {
      const existing = await prisma.rating.findUnique({
        where: {
          designId_authorId: {
            designId: design.id,
            authorId: userId,
          },
        },
        select: { value: true },
      })
      myRating = existing?.value ?? null
    }

    return NextResponse.json({
      averageRating: rating._avg.value ?? 0,
      totalRatings: rating._count._all,
      myRating,
    })
  } catch (error) {
    console.error("[RATINGS_GET]", error)
    return NextResponse.json({ error: "Failed to load ratings." }, { status: 500 })
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
    const value = Number(body.value)

    if (!Number.isFinite(value) || value < 1 || value > 5) {
      return NextResponse.json({ error: "Rating value must be between 1 and 5." }, { status: 400 })
    }

    await prisma.rating.upsert({
      where: {
        designId_authorId: {
          designId: design.id,
          authorId: userId,
        },
      },
      update: { value },
      create: {
        value,
        designId: design.id,
        authorId: userId,
      },
    })

    const rating = await prisma.rating.aggregate({
      where: { designId: design.id },
      _avg: { value: true },
      _count: { _all: true },
    })

    return NextResponse.json({
      averageRating: rating._avg.value ?? 0,
      totalRatings: rating._count._all,
    })
  } catch (error) {
    console.error("[RATINGS_POST]", error)
    return NextResponse.json({ error: "Failed to submit rating." }, { status: 500 })
  }
}

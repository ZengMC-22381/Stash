import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET() {
  try {
    const designs = await prisma.design.findMany({
      take: 6,
      orderBy: { ratings: { _count: "desc" } },
      include: {
        author: { select: { id: true, name: true, handle: true } },
        category: true,
        tags: { include: { tag: true } },
        images: { orderBy: { order: "asc" } },
        _count: { select: { comments: true, ratings: true } },
      },
    })

    return NextResponse.json({ designs })
  } catch (error) {
    console.error("[DESIGNS_FEATURED]", error)
    return NextResponse.json({ error: "Failed to load featured designs." }, { status: 500 })
  }
}

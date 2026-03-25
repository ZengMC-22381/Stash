import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserIdFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const slug = typeof body.slug === "string" ? body.slug.trim() : ""
    const userId = await getUserIdFromRequest(request)

    let designId: string | null = null
    if (slug) {
      const design = await prisma.design.findUnique({
        where: { slug },
        select: { id: true },
      })
      designId = design?.id ?? null
    }

    await prisma.copyEvent.create({
      data: {
        designId,
        userId: userId || null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[COPIES_POST]", error)
    return NextResponse.json({ error: "Failed to record copy event." }, { status: 500 })
  }
}

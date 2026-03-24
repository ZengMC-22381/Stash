import { NextRequest, NextResponse } from "next/server"
import { LOCALE_COOKIE_NAME, localizeTopic, normalizeLocale } from "@/lib/locale"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const locale = normalizeLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value)

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { designs: true } } },
    })

    const payload = categories.map((category) => {
      const localized = localizeTopic(category.slug, locale, category.name, category.description)
      return {
        id: category.id,
        name: localized.title,
        slug: category.slug,
        description: localized.description,
        designCount: category._count.designs,
      }
    })

    return NextResponse.json({ categories: payload })
  } catch (error) {
    console.error("[CATEGORIES_GET]", error)
    return NextResponse.json({ error: "Failed to load categories." }, { status: 500 })
  }
}

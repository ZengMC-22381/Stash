import { NextRequest, NextResponse } from "next/server"
import { LOCALE_COOKIE_NAME, localizeTopic, normalizeLocale } from "@/lib/locale"
import { prisma } from "@/lib/prisma"
import { buildDerivedFacetItems } from "@/lib/search-facets"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const locale = normalizeLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value)

    const [categories, designs] = await Promise.all([
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { designs: true } } },
      }),
      prisma.design.findMany({
        select: {
          title: true,
          description: true,
          content: true,
          category: { select: { slug: true } },
          tags: { select: { tag: { select: { slug: true, name: true } } } },
        },
      }),
    ])

    const types = categories
      .map((category) => {
        const localized = localizeTopic(category.slug, locale, category.name, category.description)
        return {
          id: category.id,
          name: localized.title,
          slug: category.slug,
          designCount: category._count.designs,
        }
      })
      .sort((a, b) => {
        if (b.designCount !== a.designCount) return b.designCount - a.designCount
        return a.name.localeCompare(b.name)
      })

    const derived = buildDerivedFacetItems(
      designs.map((design) => ({
        title: design.title,
        description: design.description,
        content: design.content,
        categorySlug: design.category?.slug,
        tags: design.tags.map((entry) => entry.tag),
      })),
      locale
    )

    return NextResponse.json({
      facets: {
        types,
        styles: derived.styles,
        frameworks: derived.frameworks,
        fonts: derived.fonts,
        platforms: derived.platforms,
      },
    })
  } catch (error) {
    console.error("[SEARCH_FACETS_GET]", error)
    return NextResponse.json({ error: "Failed to load search facets." }, { status: 500 })
  }
}

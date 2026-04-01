import type { Locale } from "@/lib/locale"

export type SearchTabId = "types" | "styles" | "frameworks" | "fonts" | "platforms"
export type SearchDerivedFacetGroup = Exclude<SearchTabId, "types">

export type SearchFacetItem = {
  id: string
  name: string
  slug: string
  designCount: number
}

export type FacetTagLike = {
  slug?: string | null
  name?: string | null
}

export type FacetDesignLike = {
  title?: string | null
  description?: string | null
  contentText?: string | null
  categorySlug?: string | null
  tags?: FacetTagLike[]
}

type Detector = {
  slug: string
  name: string
  nameZh: string
  keywords: string[]
}

const STYLE_DETECTORS: Detector[] = [
  { slug: "minimal", name: "Minimal", nameZh: "极简", keywords: ["minimal", "极简", "clean"] },
  { slug: "editorial", name: "Editorial", nameZh: "编辑感", keywords: ["editorial", "magazine"] },
  { slug: "glassmorphism", name: "Glassmorphism", nameZh: "玻璃拟态", keywords: ["glassmorphism", "glass"] },
  { slug: "brutalist", name: "Brutalist", nameZh: "野兽主义", keywords: ["brutalist"] },
  { slug: "dark", name: "Dark", nameZh: "深色", keywords: ["dark"] },
  { slug: "light", name: "Light", nameZh: "浅色", keywords: ["light"] },
]

const FRAMEWORK_DETECTORS: Detector[] = [
  { slug: "react", name: "React", nameZh: "React", keywords: ["react", "reactjs", "react.js"] },
  { slug: "nextjs", name: "Next.js", nameZh: "Next.js", keywords: ["nextjs", "next.js", "next js"] },
  { slug: "vue", name: "Vue", nameZh: "Vue", keywords: ["vue"] },
  { slug: "svelte", name: "Svelte", nameZh: "Svelte", keywords: ["svelte"] },
  { slug: "angular", name: "Angular", nameZh: "Angular", keywords: ["angular"] },
  { slug: "tailwind", name: "Tailwind CSS", nameZh: "Tailwind CSS", keywords: ["tailwind"] },
  { slug: "flutter", name: "Flutter", nameZh: "Flutter", keywords: ["flutter"] },
  { slug: "swiftui", name: "SwiftUI", nameZh: "SwiftUI", keywords: ["swiftui"] },
]

const FONT_DETECTORS: Detector[] = [
  { slug: "inter", name: "Inter", nameZh: "Inter", keywords: ["inter"] },
  { slug: "roboto", name: "Roboto", nameZh: "Roboto", keywords: ["roboto"] },
  { slug: "sf-pro", name: "SF Pro", nameZh: "SF Pro", keywords: ["sf pro", "sf-pro", "sfpro"] },
  {
    slug: "jetbrains-mono",
    name: "JetBrains Mono",
    nameZh: "JetBrains Mono",
    keywords: ["jetbrains mono", "jetbrains-mono"],
  },
  {
    slug: "plus-jakarta-sans",
    name: "Plus Jakarta Sans",
    nameZh: "Plus Jakarta Sans",
    keywords: ["plus jakarta sans", "plus-jakarta-sans"],
  },
  {
    slug: "playfair-display",
    name: "Playfair Display",
    nameZh: "Playfair Display",
    keywords: ["playfair display", "playfair-display"],
  },
]

const PLATFORM_DETECTORS: Detector[] = [
  { slug: "web", name: "Web", nameZh: "Web", keywords: ["web", "browser", "saas", "dashboard", "landing page"] },
  { slug: "mobile", name: "Mobile", nameZh: "移动端", keywords: ["mobile", "mobile app"] },
  { slug: "ios", name: "iOS", nameZh: "iOS", keywords: ["ios"] },
  { slug: "android", name: "Android", nameZh: "Android", keywords: ["android"] },
  { slug: "desktop", name: "Desktop", nameZh: "桌面端", keywords: ["desktop", "macos", "windows"] },
]

const CATEGORY_PLATFORM_MAP: Record<string, string> = {
  "mobile-app": "mobile",
}

type FacetSignalSet = Record<SearchDerivedFacetGroup, Set<string>>

const detectorMap: Record<SearchDerivedFacetGroup, Detector[]> = {
  styles: STYLE_DETECTORS,
  frameworks: FRAMEWORK_DETECTORS,
  fonts: FONT_DETECTORS,
  platforms: PLATFORM_DETECTORS,
}

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function normalizeSlugList(values: string[] | undefined) {
  return Array.from(
    new Set(
      (values || [])
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

function humanizeSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ")
}

function matchesPrefixedSlug(tagSlug: string, prefix: string) {
  if (tagSlug.startsWith(`${prefix}-`)) return tagSlug.slice(prefix.length + 1)
  if (tagSlug.startsWith(`${prefix}:`)) return tagSlug.slice(prefix.length + 1)
  return null
}

function getTagSlugs(tags: FacetTagLike[] | undefined) {
  if (!tags?.length) return []

  return tags
    .map((tag) => tag.slug || (tag.name ? toSlug(tag.name) : ""))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

function addDetectorSignals(
  set: Set<string>,
  detectors: Detector[],
  text: string,
  tagSlugs: string[],
  prefix: SearchDerivedFacetGroup
) {
  for (const detector of detectors) {
    const matchedByText = detector.keywords.some((keyword) => text.includes(keyword))
    const matchedByTag = tagSlugs.some(
      (tagSlug) =>
        tagSlug === detector.slug ||
        tagSlug === `${prefix}-${detector.slug}` ||
        tagSlug === `${prefix}:${detector.slug}`
    )

    if (matchedByText || matchedByTag) {
      set.add(detector.slug)
    }
  }
}

function addPrefixedSignals(set: Set<string>, tagSlugs: string[], prefix: SearchDerivedFacetGroup) {
  for (const tagSlug of tagSlugs) {
    const extracted = matchesPrefixedSlug(tagSlug, prefix)
    if (extracted) {
      set.add(extracted)
    }
  }
}

export function deriveFacetSignals(input: FacetDesignLike): FacetSignalSet {
  const styleSet = new Set<string>()
  const frameworkSet = new Set<string>()
  const fontSet = new Set<string>()
  const platformSet = new Set<string>()
  const tagSlugs = getTagSlugs(input.tags)

  const sourceText = [input.title, input.description, input.contentText, tagSlugs.join(" "), input.categorySlug]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  addDetectorSignals(styleSet, STYLE_DETECTORS, sourceText, tagSlugs, "styles")
  addDetectorSignals(frameworkSet, FRAMEWORK_DETECTORS, sourceText, tagSlugs, "frameworks")
  addDetectorSignals(fontSet, FONT_DETECTORS, sourceText, tagSlugs, "fonts")
  addDetectorSignals(platformSet, PLATFORM_DETECTORS, sourceText, tagSlugs, "platforms")

  addPrefixedSignals(styleSet, tagSlugs, "styles")
  addPrefixedSignals(frameworkSet, tagSlugs, "frameworks")
  addPrefixedSignals(fontSet, tagSlugs, "fonts")
  addPrefixedSignals(platformSet, tagSlugs, "platforms")

  const categorySlug = input.categorySlug?.trim().toLowerCase()
  if (categorySlug) {
    platformSet.add(CATEGORY_PLATFORM_MAP[categorySlug] || "web")
  }

  return {
    styles: styleSet,
    frameworks: frameworkSet,
    fonts: fontSet,
    platforms: platformSet,
  }
}

type DerivedFacetFilters = {
  styles?: string[]
  frameworks?: string[]
  fonts?: string[]
  platforms?: string[]
}

function matchGroup(selected: string[], actual: Set<string>) {
  if (selected.length === 0) return true
  return selected.some((slug) => actual.has(slug))
}

export function matchesDerivedFacetFilters(input: FacetDesignLike, filters: DerivedFacetFilters) {
  const selectedStyles = normalizeSlugList(filters.styles)
  const selectedFrameworks = normalizeSlugList(filters.frameworks)
  const selectedFonts = normalizeSlugList(filters.fonts)
  const selectedPlatforms = normalizeSlugList(filters.platforms)

  if (
    selectedStyles.length === 0 &&
    selectedFrameworks.length === 0 &&
    selectedFonts.length === 0 &&
    selectedPlatforms.length === 0
  ) {
    return true
  }

  const signals = deriveFacetSignals(input)

  return (
    matchGroup(selectedStyles, signals.styles) &&
    matchGroup(selectedFrameworks, signals.frameworks) &&
    matchGroup(selectedFonts, signals.fonts) &&
    matchGroup(selectedPlatforms, signals.platforms)
  )
}

export function getFacetDisplayName(group: SearchDerivedFacetGroup, slug: string, locale: Locale) {
  const normalizedSlug = slug.trim().toLowerCase()
  const detector = detectorMap[group].find((item) => item.slug === normalizedSlug)
  if (detector) {
    return locale === "zh" ? detector.nameZh : detector.name
  }
  return humanizeSlug(normalizedSlug)
}

export function buildDerivedFacetItems(
  designs: FacetDesignLike[],
  locale: Locale
): Record<SearchDerivedFacetGroup, SearchFacetItem[]> {
  const counters: Record<SearchDerivedFacetGroup, Map<string, number>> = {
    styles: new Map(),
    frameworks: new Map(),
    fonts: new Map(),
    platforms: new Map(),
  }

  for (const design of designs) {
    const signals = deriveFacetSignals(design)
    for (const group of Object.keys(counters) as SearchDerivedFacetGroup[]) {
      for (const slug of signals[group]) {
        counters[group].set(slug, (counters[group].get(slug) || 0) + 1)
      }
    }
  }

  const toSortedItems = (group: SearchDerivedFacetGroup) =>
    Array.from(counters[group].entries())
      .map(([slug, designCount]) => ({
        id: `${group}:${slug}`,
        slug,
        designCount,
        name: getFacetDisplayName(group, slug, locale),
      }))
      .sort((a, b) => {
        if (b.designCount !== a.designCount) return b.designCount - a.designCount
        return a.name.localeCompare(b.name)
      })

  return {
    styles: toSortedItems("styles"),
    frameworks: toSortedItems("frameworks"),
    fonts: toSortedItems("fonts"),
    platforms: toSortedItems("platforms"),
  }
}

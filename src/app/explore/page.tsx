import Link from "next/link"
import { ArrowRight } from "lucide-react"
import ResourceCard from "@/components/resource-card"
import TopicCard from "@/components/topic-card"
import { getResourceSummaries, getTopics } from "@/lib/data"
import { getFacetDisplayName } from "@/lib/search-facets"
import { getServerLocale } from "@/lib/server-locale"

const container = "mx-auto w-full max-w-[1100px] px-6"

type PageProps = {
  searchParams: Promise<{
    search?: string
    types?: string
    styles?: string
    frameworks?: string
    fonts?: string
    platforms?: string
  }>
}

function parseCsvParam(input?: string) {
  if (!input) return []
  return input
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search.trim() : ""
  const selectedTypes = parseCsvParam(params.types)
  const selectedStyles = parseCsvParam(params.styles)
  const selectedFrameworks = parseCsvParam(params.frameworks)
  const selectedFonts = parseCsvParam(params.fonts)
  const selectedPlatforms = parseCsvParam(params.platforms)
  const locale = await getServerLocale()
  const resources = await getResourceSummaries(12, {
    search,
    typeSlugs: selectedTypes,
    styleSlugs: selectedStyles,
    frameworkSlugs: selectedFrameworks,
    fontSlugs: selectedFonts,
    platformSlugs: selectedPlatforms,
  })
  const topics = await getTopics(locale)
  const topicNameMap = new Map(topics.map((topic) => [topic.slug, topic.title]))

  const hasFacetFilters =
    selectedTypes.length > 0 ||
    selectedStyles.length > 0 ||
    selectedFrameworks.length > 0 ||
    selectedFonts.length > 0 ||
    selectedPlatforms.length > 0

  const copy =
    locale === "zh"
      ? {
          section: "探索",
          title: "探索资源",
          subtitle: "发现最新与最受欢迎的资源，覆盖 SaaS、仪表盘、移动应用与 AI 工具。",
          all: "全部",
          newest: "最新发布",
          searchResults: "搜索结果",
          noResults: "没有找到匹配内容，试试其他关键词。",
          searchKeyword: "关键词：",
          filterType: "类型",
          filterStyle: "风格",
          filterFramework: "框架",
          filterFont: "字体",
          filterPlatform: "平台",
          back: "返回首页",
          browseTopic: "按主题浏览",
        }
      : {
          section: "Explore",
          title: "Explore Resources",
          subtitle: "Discover the newest and most remixed resources across SaaS, dashboards, mobile apps, and AI tools.",
          all: "All",
          newest: "Newest Drops",
          searchResults: "Search Results",
          noResults: "No matching designs found. Try another keyword.",
          searchKeyword: "Keyword:",
          filterType: "Type",
          filterStyle: "Style",
          filterFramework: "Framework",
          filterFont: "Font",
          filterPlatform: "Platform",
          back: "Back to Home",
          browseTopic: "Browse by Topic",
        }

  return (
    <div className="space-y-16 pb-24 pt-12">
      <section className={container}>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.section}</p>
        <h1 className="mt-3 font-display text-4xl text-slate-900 md:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">{copy.subtitle}</p>
        {search ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs text-slate-600">
            <span className="font-semibold">{copy.searchKeyword}</span>
            <span>{search}</span>
          </div>
        ) : null}
        {hasFacetFilters ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            {selectedTypes.map((type) => (
              <span key={type} className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2">
                {copy.filterType}: {topicNameMap.get(type) || type}
              </span>
            ))}
            {selectedStyles.map((style) => (
              <span key={style} className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2">
                {copy.filterStyle}: {getFacetDisplayName("styles", style, locale)}
              </span>
            ))}
            {selectedFrameworks.map((framework) => (
              <span
                key={framework}
                className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2"
              >
                {copy.filterFramework}: {getFacetDisplayName("frameworks", framework, locale)}
              </span>
            ))}
            {selectedFonts.map((font) => (
              <span key={font} className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2">
                {copy.filterFont}: {getFacetDisplayName("fonts", font, locale)}
              </span>
            ))}
            {selectedPlatforms.map((platform) => (
              <span
                key={platform}
                className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2"
              >
                {copy.filterPlatform}: {getFacetDisplayName("platforms", platform, locale)}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
          {[copy.all, ...topics.map((topic) => topic.title)].slice(0, 6).map((item) => (
            <span key={item} className="rounded-full border border-border bg-white px-4 py-2">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className={`${container} space-y-8`}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-slate-900">{search ? copy.searchResults : copy.newest}</h2>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            {copy.back}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {resources.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-white p-8 text-sm text-slate-600">{copy.noResults}</div>
        )}
      </section>

      <section className={`${container} space-y-8`}>
        <h2 className="font-display text-2xl text-slate-900">{copy.browseTopic}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  )
}

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import DesignCard from "@/components/design-card"
import TopicCard from "@/components/topic-card"
import { getDesignSummaries, getTopics } from "@/lib/data"
import { getServerLocale } from "@/lib/server-locale"

const container = "mx-auto w-full max-w-[1100px] px-6"

type PageProps = {
  searchParams: Promise<{ search?: string }>
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = typeof params.search === "string" ? params.search.trim() : ""
  const locale = await getServerLocale()
  const designs = await getDesignSummaries(12, { search })
  const topics = await getTopics(locale)

  const copy =
    locale === "zh"
      ? {
          section: "探索",
          title: "探索 DESIGN.md",
          subtitle: "发现最新与最受欢迎的 Prompt 方案，覆盖 SaaS、仪表盘、移动应用与 AI 工具。",
          all: "全部",
          newest: "最新发布",
          searchResults: "搜索结果",
          noResults: "没有找到匹配内容，试试其他关键词。",
          searchKeyword: "关键词",
          back: "返回首页",
          browseTopic: "按主题浏览",
        }
      : {
          section: "Explore",
          title: "Explore DESIGN.md",
          subtitle: "Discover the newest and most remixed prompts across SaaS, dashboards, mobile apps, and AI tools.",
          all: "All",
          newest: "Newest Drops",
          searchResults: "Search Results",
          noResults: "No matching designs found. Try another keyword.",
          searchKeyword: "Keyword",
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
        {designs.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {designs.map((design) => (
              <DesignCard key={design.id} design={design} locale={locale} />
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

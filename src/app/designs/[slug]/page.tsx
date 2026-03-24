/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { notFound } from "next/navigation"
import DesignCard from "@/components/design-card"
import DesignActions from "@/components/design-actions"
import DesignEngagement from "@/components/design-engagement"
import DesignMdViewer from "@/components/design-md-viewer"
import { getAuthorProfile, getDesignDetail, getRelatedDesigns } from "@/lib/data"
import { formatCompact } from "@/lib/format"
import { getServerLocale } from "@/lib/server-locale"

const container = "mx-auto w-full max-w-[1100px] px-6"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function DesignDetailPage({ params }: PageProps) {
  const locale = await getServerLocale()
  const { slug } = await params
  const design = await getDesignDetail(slug)
  if (!design) {
    notFound()
  }

  const related = await getRelatedDesigns(slug, 3)
  const authorProfile = await getAuthorProfile(design.author.handle)

  const copy =
    locale === "zh"
      ? {
          back: "← 返回探索",
          section: "设计详情",
          comments: "条评论",
          ratings: "个评分",
          updated: "更新于",
          outputVisuals: "效果图输出",
          main: "主图",
          output: "效果",
          outputLabel: "输出",
          follow: "关注",
          statsDesigns: "份设计",
          statsComments: "条评论",
          statsRatings: "个评分",
          related: "相关推荐",
          moreFromCommunity: "更多社区作品",
          viewAll: "查看全部",
          engagementTitle: "探索更多 DESIGN.md",
          exploreAll: "浏览全部",
          copyTag: "复制",
          remixTag: "Remix",
        }
      : {
          back: "← Back to Explore",
          section: "Design Detail",
          comments: " comments",
          ratings: " ratings",
          updated: "Updated",
          outputVisuals: "OUTPUT VISUALS",
          main: "Main",
          output: "Output",
          outputLabel: "Output",
          follow: "Follow",
          statsDesigns: " designs",
          statsComments: " comments",
          statsRatings: " ratings",
          related: "Related",
          moreFromCommunity: "More from the community",
          viewAll: "View all",
          engagementTitle: "Explore more DESIGN.md",
          exploreAll: "Explore all",
          copyTag: "Copy",
          remixTag: "Remix",
        }

  return (
    <div className="space-y-16 pb-24 pt-12">
      <section className={container}>
        <Link href="/explore" className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          {copy.back}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.section}</p>
            <h1 className="font-display text-4xl text-slate-900 md:text-5xl">{design.title}</h1>
            <p className="max-w-2xl text-base text-slate-600">{design.description}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              {design.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-white px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-primary" />
                {design.stats.averageRating.toFixed(1)}
              </span>
              <span>
                {formatCompact(design.stats.comments, locale)}
                {copy.comments}
              </span>
              <span>
                {formatCompact(design.stats.ratings, locale)}
                {copy.ratings}
              </span>
            </div>
          </div>
          <DesignActions slug={design.slug} content={design.content} locale={locale} />
        </div>
      </section>

      <section className={`${container} grid gap-8 lg:grid-cols-[1.1fr_0.9fr]`}>
        <div className="rounded-3xl border border-border bg-[#0F0F17] p-6 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97]" />
              <div>
                <div className="text-xs font-semibold text-white">{design.author.name}</div>
                <div className="text-[11px] text-slate-400">@{design.author.handle}</div>
              </div>
            </div>
            <span>
              {copy.updated} {new Date(design.updatedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-slate-400">
            <span className="rounded-full bg-white/10 px-3 py-1">DESIGN.md</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{copy.copyTag}</span>
            <span className="rounded-full bg-white/10 px-3 py-1">{copy.remixTag}</span>
          </div>
          <div className="mt-6">
            <DesignMdViewer content={design.content} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-white p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
              <span className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                {copy.outputVisuals}
              </span>
              <span>{copy.main}</span>
            </div>
            {design.images[0] ? (
              <img src={design.images[0].url} alt={design.title} className="h-56 w-full rounded-2xl object-cover" />
            ) : (
              <div className="h-56 rounded-2xl bg-gradient-to-br from-[#0A0A0A] via-[#1F1F2D] to-[#2A2A3C]" />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {design.images.slice(1, 3).map((image, index) => (
              <div key={image.url} className="rounded-3xl border border-border bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {image.caption || `${copy.output} ${index + 2}`}
                  </span>
                  <span>{copy.outputLabel}</span>
                </div>
                <img src={image.url} alt={image.caption || design.title} className="h-40 w-full rounded-2xl object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${container} grid gap-8 lg:grid-cols-[1.1fr_0.9fr]`}>
        <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97]" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{design.author.name}</p>
                <p className="text-xs text-slate-500">@{design.author.handle}</p>
              </div>
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-semibold text-slate-700">
              {copy.follow}
            </button>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {(authorProfile?.stats.designs || 0) + copy.statsDesigns} · {(authorProfile?.stats.comments || 0) + copy.statsComments} · {(authorProfile?.stats.ratings || 0) + copy.statsRatings}
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-600">
            {design.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-secondary px-3 py-1">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.related}</p>
              <h2 className="mt-3 font-display text-2xl text-slate-900">{copy.moreFromCommunity}</h2>
            </div>
            <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              {copy.viewAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {related.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.author.name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Star className="h-4 w-4 text-primary" />
                  {item.stats.averageRating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={container}>
        <DesignEngagement slug={design.slug} locale={locale} />
      </section>

      <section className={container}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-slate-900">{copy.engagementTitle}</h2>
          <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            {copy.exploreAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {related.map((item) => (
            <DesignCard key={item.id} design={item} locale={locale} />
          ))}
        </div>
      </section>
    </div>
  )
}

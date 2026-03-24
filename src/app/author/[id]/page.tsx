import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { notFound } from "next/navigation"
import DesignCard from "@/components/design-card"
import { getAuthorProfile, getDesignsByAuthor } from "@/lib/data"
import { getServerLocale } from "@/lib/server-locale"

const container = "mx-auto w-full max-w-[1100px] px-6"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AuthorPage({ params }: PageProps) {
  const locale = await getServerLocale()
  const { id } = await params
  const author = await getAuthorProfile(id)
  if (!author) {
    notFound()
  }

  const designs = await getDesignsByAuthor(author.id)

  const copy =
    locale === "zh"
      ? {
          creator: "创作者",
          bioFallback: "专注为现代产品团队创作高质量 DESIGN.md 方案。",
          badge1: "高热作者",
          badge2: "编辑感",
          badge3: "社区共创",
          designs: "作品",
          comments: "评论",
          ratings: "评分",
          follow: "关注",
          message: "私信",
          portfolio: "作品集",
          published: "已发布 DESIGN.md",
          viewAll: "查看全部",
          remixQueue: "Remix 候选",
          remixTitle: `加入 ${author.name} 的 Remix 圈`,
          remixDesc: "抢先获取新 Prompt，并在 Remix 过程中获得反馈建议。",
          joinCircle: "加入圈子",
          learnMore: "了解更多",
        }
      : {
          creator: "Creator",
          bioFallback: "Designing premium DESIGN.md prompts for modern product teams.",
          badge1: "Top Creator",
          badge2: "Editorial",
          badge3: "Community",
          designs: "Designs",
          comments: "Comments",
          ratings: "Ratings",
          follow: "Follow",
          message: "Message",
          portfolio: "Portfolio",
          published: "Published DESIGN.md",
          viewAll: "View all",
          remixQueue: "Remix Queue",
          remixTitle: `Join ${author.name}'s remix circle`,
          remixDesc: "Get early access to new prompts and receive feedback on your remixes.",
          joinCircle: "Join the circle",
          learnMore: "Learn more",
        }

  return (
    <div className="space-y-16 pb-24 pt-12">
      <section className={container}>
        <div className="grid gap-8 rounded-[36px] border border-border bg-[linear-gradient(135deg,_#F8F4FF_0%,_#FFF4F8_50%,_#F4F8FF_100%)] p-8 shadow-soft md:grid-cols-[1.2fr_0.8fr]">
          <div className="flex items-start gap-6">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97]" />
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.creator}</p>
                <h1 className="font-display text-3xl text-slate-900 md:text-4xl">{author.name}</h1>
                <p className="text-sm text-slate-500">@{author.handle}</p>
              </div>
              <p className="max-w-xl text-sm text-slate-600">{author.bio || copy.bioFallback}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                {[copy.badge1, copy.badge2, copy.badge3].map((badge) => (
                  <span key={badge} className="rounded-full bg-white/70 px-3 py-1">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl border border-border bg-white/80 p-4">
                <div className="text-xl font-semibold text-slate-900">{author.stats.designs}</div>
                <div className="text-xs text-slate-500">{copy.designs}</div>
              </div>
              <div className="rounded-2xl border border-border bg-white/80 p-4">
                <div className="text-xl font-semibold text-slate-900">{author.stats.comments}</div>
                <div className="text-xs text-slate-500">{copy.comments}</div>
              </div>
              <div className="rounded-2xl border border-border bg-white/80 p-4">
                <div className="text-xl font-semibold text-slate-900">{author.stats.ratings}</div>
                <div className="text-xs text-slate-500">{copy.ratings}</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-float">
                <Sparkles className="h-4 w-4" />
                {copy.follow}
              </button>
              <button className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-semibold text-slate-700">
                {copy.message}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={`${container} space-y-8`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.portfolio}</p>
            <h2 className="mt-3 font-display text-3xl text-slate-900">{copy.published}</h2>
          </div>
          <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            {copy.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {designs.map((design) => (
            <DesignCard key={design.id} design={design} locale={locale} />
          ))}
        </div>
      </section>

      <section className={container}>
        <div className="grid gap-6 rounded-[36px] border border-border bg-gradient-to-br from-[#F8F4FF] via-white to-[#FFF4F8] p-8 shadow-soft md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.remixQueue}</p>
            <h2 className="font-display text-2xl text-slate-900">{copy.remixTitle}</h2>
            <p className="text-sm text-slate-600">{copy.remixDesc}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-float">
              {copy.joinCircle}
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-semibold text-slate-700">
              {copy.learnMore}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowRight, Copy, Heart, Layers, Sparkles } from "lucide-react"
import AvatarStack from "@/components/avatar-stack"
import DesignCard from "@/components/design-card"
import TopicCard from "@/components/topic-card"
import { getDesignDetail, getFeaturedDesigns, getTopics } from "@/lib/data"
import { getServerLocale } from "@/lib/server-locale"

const container = "mx-auto w-full max-w-[1100px] px-6"

const fallbackDocZh = `# DESIGN.md

## 目标
为现代 SaaS 团队打造高级感新手引导体验。

## 视觉语言
- 强排版与编辑感标题
- 柔和渐变点缀
- 大圆角卡片与胶囊按钮
- 悬浮与微动效

## 布局结构
1. 主视觉 + 双 CTA
2. 三步引导卡片
3. 功能亮点网格
4. 头像社证明带
`

const fallbackDocEn = `# DESIGN.md

## Purpose
Craft a premium onboarding experience for modern SaaS teams.

## Visual Language
- Editorial typography
- Soft gradient accents
- Rounded cards and pill buttons
- Gentle motion on hover

## Layout Structure
1. Hero headline with dual CTA
2. Step-by-step onboarding cards
3. Feature grid with short labels
4. Social proof band with avatars
`

export default async function Home() {
  const locale = await getServerLocale()
  const featuredDesigns = await getFeaturedDesigns(4)
  const topics = await getTopics(locale)
  const preview = featuredDesigns[0] ? await getDesignDetail(featuredDesigns[0].slug) : null

  const copy =
    locale === "zh"
      ? {
          badge: "DESIGN.md 中文社区",
          titleA: "发现真正",
          titleB: "可落地的 DESIGN.md",
          subtitle: "浏览真实 Prompt 与对应 UI 效果图，查看设计师实际交付方案并快速 Remix。",
          ctaExplore: "浏览设计",
          ctaSubmit: "投稿 DESIGN.md",
          creatorsToday: "1,284 位创作者今日分享",
          remixes: "5.8k 次 Remix",
          saves: "22k 次收藏",
          product: "产品定位",
          productValue: "设计社区",
          stack: "技术栈",
          stackValue: "Next.js + Tailwind",
          docLayout: "布局：主视觉 + 引导步骤 + 功能亮点",
          output: "效果图",
          heroUi: "首屏 UI",
          trending: "趋势",
          today: "今天",
          copies: "复制次数",
          remixers: "12 位 Remix 作者",
          featured: "精选",
          featuredTitle: "精选 DESIGN.md",
          viewAll: "查看全部",
          browse: "分类浏览",
          browseTitle: "按主题浏览",
          detailPreview: "详情预览",
          detailTitle: "DESIGN.md + 效果图",
          like: "点赞",
          copy: "复制",
          remix: "Remix",
          updated2d: "2 天前更新",
          view: "查看",
          community: "社区",
          publishToday: "今天就发布你的 DESIGN.md",
          publishDesc: "上传 Prompt 并附上效果图，让社区基于你的思路继续 Remix。",
          submitDesign: "立即投稿",
          learnMore: "了解更多",
          previewFallbackA: "主视觉",
          previewFallbackB: "引导步骤",
          previewFallbackC: "功能网格",
          previewOutput: "效果",
          previewTagLine: "SaaS / 极简 / 编辑感",
        }
      : {
          badge: "The #1 DESIGN.md Community",
          titleA: "Discover DESIGN.md",
          titleB: "that actually works",
          subtitle:
            "Browse real prompt presets with matching UI outputs. Explore what designers actually ship and remix them into your own workflows.",
          ctaExplore: "Explore Designs",
          ctaSubmit: "Submit Your DESIGN.md",
          creatorsToday: "1,284 creators sharing today",
          remixes: "5.8k remixes",
          saves: "22k saves",
          product: "Product",
          productValue: "Design Community",
          stack: "Stack",
          stackValue: "Next.js + Tailwind",
          docLayout: "Layout: hero + steps + features",
          output: "Output",
          heroUi: "Hero UI",
          trending: "Trending",
          today: "Today",
          copies: "copies",
          remixers: "12 remixers",
          featured: "Featured",
          featuredTitle: "Featured DESIGN.md",
          viewAll: "View all",
          browse: "Browse",
          browseTitle: "Browse by Topic",
          detailPreview: "Detail Preview",
          detailTitle: "DESIGN.md + Output",
          like: "Like",
          copy: "Copy",
          remix: "Remix",
          updated2d: "Updated 2 days ago",
          view: "View",
          community: "Community",
          publishToday: "Publish your DESIGN.md today",
          publishDesc: "Share a prompt, attach the output, and let the community remix it into new variations.",
          submitDesign: "Submit a DESIGN.md",
          learnMore: "Learn more",
          previewFallbackA: "Hero",
          previewFallbackB: "Onboarding Steps",
          previewFallbackC: "Feature Grid",
          previewOutput: "Output",
          previewTagLine: "SaaS / Minimal / Editorial",
        }

  const previewItems = preview?.images?.length
    ? preview.images.slice(0, 3).map((image, index) => ({
        label: image.caption || `${copy.previewOutput} ${index + 1}`,
        image: image.url,
      }))
    : [
        { label: copy.previewFallbackA, image: null },
        { label: copy.previewFallbackB, image: null },
        { label: copy.previewFallbackC, image: null },
      ]

  return (
    <div className="space-y-24 pb-24">
      <section className="relative border-b border-border bg-[linear-gradient(135deg,_#F8F4FF_0%,_#FFF4F8_50%,_#F4F8FF_100%)] py-20 lg:py-32">
        <div className={`${container} grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]`}>
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              {copy.badge}
            </div>
            <h1 className="font-display text-5xl leading-tight text-slate-900 md:text-6xl lg:text-[72px] lg:leading-[1.05]">
              {copy.titleA}
              <span className="block italic text-primary">{copy.titleB}</span>
            </h1>
            <p className="max-w-xl text-lg text-slate-600">{copy.subtitle}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/explore"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-float transition duration-150 hover:brightness-105 active:scale-[0.97]"
              >
                {copy.ctaExplore}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/submit"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white/90 px-6 text-sm font-semibold text-slate-700 shadow-soft transition duration-150 hover:border-primary"
              >
                {copy.ctaSubmit}
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-3">
                <AvatarStack />
                <span>{copy.creatorsToday}</span>
              </div>
              <div className="flex items-center gap-6">
                <span>{copy.remixes}</span>
                <span>{copy.saves}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-8 text-xs text-slate-500">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.product}</div>
                <div className="mt-1 text-sm font-semibold text-slate-700">{copy.productValue}</div>
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{copy.stack}</div>
                <div className="mt-1 text-sm font-semibold text-slate-700">{copy.stackValue}</div>
              </div>
            </div>
          </div>

          <div className="relative h-[520px]">
            <div className="absolute -left-2 top-0 w-64 rounded-3xl border border-border bg-white/90 p-5 shadow-float backdrop-blur animate-float-slow">
              <div className="text-xs font-semibold text-slate-500">DESIGN.md</div>
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="h-2 w-3/4 rounded-full bg-slate-200" />
                <div className="h-2 w-full rounded-full bg-slate-200" />
                <div className="h-2 w-5/6 rounded-full bg-slate-200" />
                <div className="h-2 w-2/3 rounded-full bg-slate-200" />
              </div>
              <div className="mt-6 rounded-2xl border border-border bg-muted px-3 py-2 text-[11px] text-slate-500">
                {copy.docLayout}
              </div>
            </div>

            <div className="absolute right-0 top-8 w-72 rounded-[32px] border border-border bg-gradient-to-br from-[#E8E0FF] via-white to-white p-4 shadow-float animate-float-fast">
              <div className="overflow-hidden rounded-3xl bg-white">
                <div className="h-36 bg-gradient-to-br from-[#0A0A0A] to-[#1F1F2D]" />
                <div className="space-y-2 p-4">
                  <div className="h-2 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-2 w-full rounded-full bg-slate-200" />
                  <div className="h-2 w-2/3 rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full border border-border bg-white px-3 py-1">{copy.output}</span>
                <span>{copy.heroUi}</span>
              </div>
            </div>

            <div className="absolute bottom-16 left-12 w-60 rounded-3xl border border-border bg-white/90 p-4 shadow-float backdrop-blur">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="rounded-full bg-secondary px-3 py-1">{copy.trending}</span>
                <span>{copy.today}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">2,340</div>
                  <div className="text-xs text-slate-500">{copy.copies}</div>
                </div>
                <div className="h-10 w-16 rounded-2xl bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97]" />
              </div>
            </div>

            <div className="absolute bottom-0 right-8 w-56 rounded-3xl border border-border bg-white/90 p-4 shadow-float backdrop-blur">
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                {copy.previewTagLine.split(" / ").map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                <AvatarStack />
                <span>{copy.remixers}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${container} space-y-10`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.featured}</p>
            <h2 className="mt-3 font-display text-3xl text-slate-900 md:text-4xl">{copy.featuredTitle}</h2>
          </div>
          <Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            {copy.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredDesigns.map((design) => (
            <DesignCard key={design.id} design={design} locale={locale} />
          ))}
        </div>
      </section>

      <section className={`${container} space-y-10`}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.browse}</p>
          <h2 className="mt-3 font-display text-3xl text-slate-900 md:text-4xl">{copy.browseTitle}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <TopicCard key={topic.slug} topic={topic} locale={locale} />
          ))}
        </div>
      </section>

      <section className={`${container} space-y-10`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.detailPreview}</p>
            <h2 className="mt-3 font-display text-3xl text-slate-900 md:text-4xl">{copy.detailTitle}</h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-semibold text-slate-600">
              <Heart className="h-4 w-4" />
              {copy.like}
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-semibold text-slate-600">
              <Copy className="h-4 w-4" />
              {copy.copy}
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-semibold text-slate-600">
              <Layers className="h-4 w-4" />
              {copy.remix}
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-[#0F0F17] p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300">
                DESIGN.md
              </span>
              <span>{copy.updated2d}</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-200">
              {preview?.content || (locale === "zh" ? fallbackDocZh : fallbackDocEn)}
            </pre>
          </div>

          <div className="space-y-4">
            {previewItems.map((item, index) => (
              <div key={item.label} className="rounded-3xl border border-border bg-white p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-semibold text-slate-600">
                    {item.label}
                  </span>
                  <span>{copy.view}</span>
                </div>
                {item.image ? (
                  <img src={item.image} alt={item.label} className="h-44 w-full rounded-2xl object-cover" />
                ) : (
                  <div
                    className={`h-44 rounded-2xl bg-gradient-to-br ${
                      index === 0
                        ? "from-[#0A0A0A] via-[#1F1F2D] to-[#2A2A3C]"
                        : index === 1
                          ? "from-[#FFE1EE] via-[#FFF4F8] to-white"
                          : "from-[#DFF7F1] via-[#F4FFFA] to-white"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${container}`}>
        <div className="grid gap-8 rounded-[36px] border border-border bg-white p-10 shadow-soft lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.community}</p>
            <h2 className="font-display text-3xl text-slate-900 md:text-4xl">{copy.publishToday}</h2>
            <p className="text-sm text-slate-600">{copy.publishDesc}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/submit"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-float transition duration-150 hover:brightness-105 active:scale-[0.97]"
            >
              {copy.submitDesign}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-6 text-sm font-semibold text-slate-700"
            >
              {copy.learnMore}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

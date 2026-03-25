/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowRight, Copy, Heart, Layers, Sparkles } from "lucide-react"
import DesignCard from "@/components/design-card"
import TopicCard from "@/components/topic-card"
import RotatingHeroWord from "@/components/rotating-hero-word"
import { getDesignDetail, getFeaturedDesigns, getHomeHeroStats, getTopics } from "@/lib/data"
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
  const [featuredDesigns, topics, heroStats] = await Promise.all([
    getFeaturedDesigns(4),
    getTopics(locale),
    getHomeHeroStats(),
  ])
  const preview = featuredDesigns[0] ? await getDesignDetail(featuredDesigns[0].slug) : null
  const numberLocale = locale === "zh" ? "zh-CN" : "en-US"

  const copy =
    locale === "zh"
      ? {
          heroBadge: "把AI时代的设计逻辑，变成可展示的资产",
          titleA: "发现真正有效的",
          heroWords: ["DESIGN.md", "Skill", "设计Agent"],
          subtitle: "分享真正可直接使用的、AI时代的设计技巧。",
          ctaExplore: "浏览设计",
          ctaSubmit: "投稿 DESIGN.md",
          trending: "趋势",
          today: "今天",
          copies: "复制次数",
          heroTags: ["SaaS", "极简", "呼吸感"],
          contributorsSuffix: "位 贡献者",
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
          heroBadge: "Turn AI-era design logic into reusable assets",
          titleA: "Discover what actually works",
          heroWords: ["DESIGN.md", "Skill", "Design Agent"],
          subtitle: "Share practical, ready-to-use design workflows for the AI era.",
          ctaExplore: "Explore Designs",
          ctaSubmit: "Submit Your DESIGN.md",
          trending: "Trending",
          today: "Today",
          copies: "copies",
          heroTags: ["SaaS", "Minimal", "Airy"],
          contributorsSuffix: "contributors",
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
  const todayCopyCountLabel = heroStats.todayCopyCount.toLocaleString(numberLocale)
  const contributorCountLabel = `${heroStats.contributorCount.toLocaleString(numberLocale)} ${copy.contributorsSuffix}`
  const heroContributorTones = [
    "from-[#6C47FF] via-[#8B5CF6] to-[#FF6B97]",
    "from-[#3B82F6] via-[#60A5FA] to-[#10B981]",
    "from-[#F59E0B] via-[#F97316] to-[#EF4444]",
    "from-[#6366F1] via-[#8B5CF6] to-[#EC4899]",
  ]

  return (
    <div className="space-y-24 pb-24">
      <section className="relative border-b border-border bg-[linear-gradient(152.705deg,_#F8F4FF_0%,_#FFF4F8_50%,_#F4F8FF_100%)] px-6 pb-14 pt-24 lg:px-[89.5px] lg:pb-[56px] lg:pt-[128px]">
        <div className="mx-auto grid w-full max-w-[1100px] gap-16 lg:grid-cols-[501px_535px] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center rounded-full border border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] px-[17px] py-2 text-[11px] font-semibold uppercase tracking-[2.2px] text-[#7847ff]">
              {copy.heroBadge}
            </div>
            <div className="space-y-0">
              <h1 className="text-[56px] font-black leading-[1.05] tracking-[-0.05em] text-[#2f3334] lg:text-[72px] lg:leading-[72px]">
                {copy.titleA}
              </h1>
              <div className="font-display text-[56px] italic leading-[1.05] tracking-[-0.05em] text-[#7847ff] lg:text-[72px] lg:leading-[72px]">
                <RotatingHeroWord words={copy.heroWords} />
              </div>
            </div>
            <p className="max-w-[576px] text-[18px] leading-7 text-[#475569]">{copy.subtitle}</p>
            <div className="flex h-[44px] items-center gap-4">
              <Link
                href="/explore"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#7847ff] px-6 text-sm font-semibold text-white shadow-float transition duration-150 hover:brightness-105 active:scale-[0.97]"
              >
                {copy.ctaExplore}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/submit"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] px-6 text-sm font-semibold text-[#334155] shadow-soft transition duration-150 hover:border-[#b8bfd0]"
              >
                {copy.ctaSubmit}
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative h-[476px] w-full max-w-[535px]">
            <div className="absolute inset-0 rounded-[48px] bg-[linear-gradient(133.692deg,_#E6DEFF_0%,_#FFE5EC_100%)] opacity-20 blur-[32px]" />
            <div className="absolute inset-0 animate-float-slow overflow-visible rounded-[48px] border border-[rgba(175,178,179,0.1)] bg-white p-[13px] shadow-[0px_20px_40px_-5px_rgba(47,51,52,0.05)]">
              <div className="grid h-[450px] grid-cols-2 overflow-hidden rounded-[32px]">
                <div className="border-r border-[rgba(255,255,255,0.05)] bg-[#1e1e1e] px-8 py-8 text-[14px] leading-5">
                  <pre className="whitespace-pre-wrap text-[#e6deff]">{`# Design Configuration`}</pre>
                  <pre className="mt-2 whitespace-pre-wrap text-[#ffe5ec]">{`preset: "minimalist-saas"`}</pre>
                  <pre className="mt-2 whitespace-pre-wrap text-white">{`layout: {`}</pre>
                  <pre className="pl-4 text-[#d1d5db]">{`spacing: "extra-loose",`}</pre>
                  <pre className="pl-4 text-[#d1d5db]">{`radius: "full",`}</pre>
                  <pre className="pl-4 text-[#d1d5db]">{`surfaces: ["glass", "tonal"]`}</pre>
                  <pre className="text-white">{`}`}</pre>
                  <pre className="mt-2 text-[#e6deff]">{`colors: {`}</pre>
                  <pre className="pl-4 text-[#c084fc]">{`primary: "#615b7c",`}</pre>
                  <pre className="pl-4 text-[#f9a8d4]">{`accent: "#ffe5ec"`}</pre>
                  <pre className="text-[#e6deff]">{`}`}</pre>
                </div>
                <div className="space-y-4 bg-white p-6">
                  <div className="h-8 w-32 rounded-full bg-[#f3f4f4]" />
                  <div className="h-32 rounded-[32px] bg-[#e6deff]" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-24 rounded-[32px] bg-[#ffe5ec]" />
                    <div className="h-24 rounded-[32px] bg-[#eceeee]" />
                  </div>
                  <div className="h-20 rounded-[32px] bg-[#f3f4f4]" />
                </div>
              </div>
            </div>

            <div className="absolute left-[147.5px] top-[330px] z-20 h-[118px] w-[240px] animate-float-fast rounded-[32px] border border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] px-[17px] pb-px pt-[17px] shadow-[0px_24px_64px_0px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#f5f5f5] px-3 py-[3px] text-[12px] leading-4 text-[#64748b]">
                  {copy.trending}
                </span>
                <span className="text-[12px] leading-4 text-[#64748b]">{copy.today}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-[30px] font-semibold leading-7 text-[#0f172a]">{todayCopyCountLabel}</div>
                  <div className="text-[12px] leading-4 text-[#64748b]">{copy.copies}</div>
                </div>
                <div className="h-10 w-16 rounded-3xl bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97]" />
              </div>
            </div>

            <div
              className="absolute left-[291.7px] top-[405.5px] z-20 h-[106.5px] w-[224px] animate-float-slow rounded-[32px] border border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] px-[17px] pb-px pt-[17px] shadow-[0px_24px_64px_0px_rgba(0,0,0,0.1)]"
              style={{ animationDelay: "-2.5s" }}
            >
              <div className="flex flex-wrap gap-2">
                {copy.heroTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#f5f5f5] px-3 py-[3px] text-[11px] leading-[16.5px] text-[#475569]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center">
                  {heroContributorTones.map((tone, index) => (
                    <span
                      key={tone}
                      className={`-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${tone} text-[11px] font-semibold text-white shadow-soft`}
                      style={{ zIndex: heroContributorTones.length - index }}
                    >
                      {index + 1}
                    </span>
                  ))}
                </div>
                <span className="text-[12px] leading-4 text-[#64748b]">{contributorCountLabel}</span>
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

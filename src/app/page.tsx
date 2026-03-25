import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import HomeResourceStream from "@/components/home-resource-stream"
import RotatingHeroWord from "@/components/rotating-hero-word"
import { getHomeHeroStats } from "@/lib/data"
import { getServerLocale } from "@/lib/server-locale"

export default async function Home() {
  const locale = await getServerLocale()
  const heroStats = await getHomeHeroStats()
  const numberLocale = locale === "zh" ? "zh-CN" : "en-US"

  const copy =
    locale === "zh"
      ? {
          titleA: "发现真正有效的",
          heroWords: ["DESIGN.md", "Skill", "Agent"],
          subtitle: "分享真正可直接使用的、AI时代的设计技巧。",
          ctaExplore: "探索AI设计技巧",
          ctaSubmit: "提交作品",
          trending: "趋势",
          today: "今天",
          copies: "复制次数",
          contributorsSuffix: "位贡献者",
          badgeResource: "DESIGN.md",
          badgeSkill: "Design Skill",
          floatingCardLabel: "Simple",
          floatingCardTitle: "Design System",
          floatingCardTagA: "Minimal",
          floatingCardTagB: "Bento",
          floatingCardTime: "Today",
          floatingCardUpdated: "Updated 8:00 AM",
          heroTagA: "SaaS",
          heroTagB: "极简",
          heroTagC: "呼吸感",
        }
      : {
          titleA: "Discover what actually works",
          heroWords: ["DESIGN.md", "Skill", "Agent"],
          subtitle: "Share practical, ready-to-use design workflows for the AI era.",
          ctaExplore: "Explore AI Design Skills",
          ctaSubmit: "Submit Resource",
          trending: "Trending",
          today: "Today",
          copies: "copies",
          contributorsSuffix: "contributors",
          badgeResource: "DESIGN.md",
          badgeSkill: "Design Skill",
          floatingCardLabel: "Simple",
          floatingCardTitle: "Design System",
          floatingCardTagA: "Minimal",
          floatingCardTagB: "Bento",
          floatingCardTime: "Today",
          floatingCardUpdated: "Updated 8:00 AM",
          heroTagA: "SaaS",
          heroTagB: "Minimal",
          heroTagC: "Airy",
        }

  const todayCopyCountLabel = heroStats.todayCopyCount.toLocaleString(numberLocale)
  const contributorCountLabel = `${heroStats.contributorCount.toLocaleString(numberLocale)} ${copy.contributorsSuffix}`

  const heroContributorTones = [
    "from-[#6C47FF] via-[#8B5CF6] to-[#FF6B97]",
    "from-[#3B82F6] via-[#60A5FA] to-[#10B981]",
    "from-[#F59E0B] via-[#F97316] to-[#EF4444]",
    "from-[#6366F1] via-[#8B5CF6] to-[#EC4899]",
  ]

  return (
    <div className="bg-[#f9f9f9] pb-6">
      <section className="relative overflow-hidden pt-0">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(58%_74%_at_75%_14%,rgba(226,218,255,0.92)_0%,rgba(226,218,255,0)_72%),radial-gradient(54%_68%_at_22%_78%,rgba(255,226,236,0.9)_0%,rgba(255,226,236,0)_74%),linear-gradient(180deg,#f7f7fb_0%,#f8f8fb_28%,#f9f9f9_100%)]" />
        </div>

        <div className="relative mx-auto h-[600px] w-full max-w-[1280px] px-4 sm:px-6 lg:px-0">
          <div className="relative z-10 mx-auto flex h-full w-full max-w-[708px] flex-col items-center justify-center gap-10 px-6 text-center">
            <div className="space-y-0 leading-none tracking-[-0.05em]">
              <h1 className="mx-auto max-w-[540px] text-[56px] font-black leading-[1.02] text-[#2f3334] md:text-[72px] md:leading-[72px]">
                {copy.titleA}
              </h1>
              <div className="mx-auto max-w-[540px] font-display text-[56px] italic leading-[1.02] text-[#575172] md:text-[72px] md:leading-[72px]">
                <RotatingHeroWord words={copy.heroWords} />
              </div>
            </div>

            <p className="mx-auto max-w-[660px] text-[18px] leading-7 text-[#5c6060] md:text-[20px]">{copy.subtitle}</p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/explore"
                className="inline-flex h-[68px] items-center justify-center rounded-full bg-[#2f3334] px-10 text-[18px] font-semibold text-[#f9f9f9] shadow-[0px_20px_40px_-10px_rgba(0,0,0,0.2)] transition hover:brightness-110"
              >
                {copy.ctaExplore}
              </Link>
              <Link
                href="/submit"
                className="inline-flex h-[70px] items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-10 text-[18px] font-medium text-[#2f3334] transition hover:border-[#cbd5e1]"
              >
                {copy.ctaSubmit}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-20 hidden lg:block">
            <div className="absolute left-[92px] top-[48px] rotate-[-9deg] animate-float-fast rounded-[24px] border border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] px-4 py-3 shadow-[0px_24px_64px_0px_rgba(0,0,0,0.1)]">
              <div className="flex gap-2">
                {[copy.heroTagA, copy.heroTagB, copy.heroTagC].map((tag) => (
                  <span key={`mini-${tag}`} className="rounded-full bg-[#f5f5f5] px-2.5 py-[2px] text-[10px] text-[#475569]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <div className="flex items-center">
                  {heroContributorTones.map((tone, index) => (
                    <span
                      key={`mini-${tone}`}
                      className={`-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-gradient-to-br ${tone} text-[10px] font-semibold text-white`}
                      style={{ zIndex: heroContributorTones.length - index }}
                    >
                      {index + 1}
                    </span>
                  ))}
                </div>
                <span className="text-[12px] leading-4 text-[#64748b]">{contributorCountLabel}</span>
              </div>
            </div>

            <div
              className="absolute left-[286px] top-[252px] -rotate-[12deg] animate-float-slow rounded-full bg-[#2f3334] px-4 py-2 text-[12px] font-bold tracking-[0.05em] text-white"
              style={{ animationDelay: "-1.5s" }}
            >
              {copy.badgeResource}
            </div>

            <div
              className="absolute left-[908px] top-[116px] rotate-[6deg] animate-float-fast rounded-full bg-[#9e49f5] px-4 py-2 text-[12px] font-bold tracking-[0.05em] text-white"
              style={{ animationDelay: "-2.2s" }}
            >
              {copy.badgeSkill}
            </div>

            <div
              className="absolute left-[932px] top-[238px] w-[204px] -rotate-[7deg] animate-float-slow rounded-[24px] bg-[#4f46e5] p-5 text-white shadow-[0px_30px_60px_-15px_rgba(79,70,229,0.3)]"
              style={{ animationDelay: "-1.6s" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">{copy.floatingCardLabel}</p>
              <p className="mt-2 text-[18px] font-semibold leading-[22px]">{copy.floatingCardTitle}</p>
              <div className="mt-4 flex gap-2 text-[10px] font-semibold">
                <span className="rounded-full bg-white/20 px-3 py-1">{copy.floatingCardTagA}</span>
                <span className="rounded-full bg-white/20 px-3 py-1">{copy.floatingCardTagB}</span>
              </div>
              <p className="mt-5 text-[11px] text-white/90">
                {copy.floatingCardUpdated}, {copy.floatingCardTime}
              </p>
            </div>

            <div
              className="absolute left-[56px] top-[406px] h-[110px] w-[228px] rotate-[4deg] animate-float-fast rounded-[30px] border border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] px-[16px] pt-[16px] shadow-[0px_24px_64px_0px_rgba(0,0,0,0.1)]"
              style={{ animationDelay: "-1.1s" }}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#f5f5f5] px-3 py-[3px] text-[12px] leading-4 text-[#64748b]">{copy.trending}</span>
                <span className="text-[12px] leading-4 text-[#64748b]">{copy.today}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[33px] font-semibold leading-7 text-[#0f172a]">{todayCopyCountLabel}</div>
                  <div className="mt-0.5 text-[12px] leading-4 text-[#64748b]">{copy.copies}</div>
                </div>
                <div className="h-10 w-16 rounded-[24px] bg-[linear-gradient(148deg,#6C47FF_0%,#9D7BFF_50%,#FF6B97_100%)]" />
              </div>
            </div>

            <Sparkles className="absolute left-[1044px] top-[190px] h-5 w-5 animate-float-slow rotate-12 text-[#b8c0ff]" />
          </div>
        </div>
      </section>

      <HomeResourceStream locale={locale} />
    </div>
  )
}

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import HomeHeroFloatingLayer from "@/components/home-hero-floating-layer"
import HomeResourceStream from "@/components/home-resource-stream"
import RotatingHeroWord from "@/components/rotating-hero-word"
import { getHomeHeroStats } from "@/lib/data"
import { getCurrentUser } from "@/lib/server-auth"
import { getServerLocale } from "@/lib/server-locale"

export default async function Home() {
  const locale = await getServerLocale()
  const user = await getCurrentUser()
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
  const submitHref = user ? "/submit" : `/login?next=${encodeURIComponent("/submit")}`

  const heroContributorTones = [
    "from-[#6C47FF] via-[#8B5CF6] to-[#FF6B97]",
    "from-[#3B82F6] via-[#60A5FA] to-[#10B981]",
    "from-[#F59E0B] via-[#F97316] to-[#EF4444]",
    "from-[#6366F1] via-[#8B5CF6] to-[#EC4899]",
  ]

  return (
    <div className="bg-[#f9f9f9] pb-6">
      <section id="home-hero" className="relative overflow-hidden pt-0">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(58%_74%_at_75%_14%,rgba(226,218,255,0.92)_0%,rgba(226,218,255,0)_72%),radial-gradient(54%_68%_at_22%_78%,rgba(255,226,236,0.9)_0%,rgba(255,226,236,0)_74%),linear-gradient(180deg,#f7f7fb_0%,#f8f8fb_28%,#f9f9f9_100%)]" />
        </div>

        <div className="relative mx-auto min-h-[calc(100svh-65px)] w-full max-w-[1280px] px-4 sm:px-6 lg:px-0">
          <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] w-full max-w-[708px] flex-col items-center justify-center gap-10 px-6 text-center">
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
                href="/#directory-filter"
                className="inline-flex h-[68px] items-center justify-center rounded-full bg-[#2f3334] px-10 text-[18px] font-semibold text-[#f9f9f9] shadow-[0px_20px_40px_-10px_rgba(0,0,0,0.2)] transition hover:brightness-110"
              >
                {copy.ctaExplore}
              </Link>
              <Link
                href={submitHref}
                className="inline-flex h-[70px] items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-10 text-[18px] font-medium text-[#2f3334] transition hover:border-[#cbd5e1]"
              >
                {copy.ctaSubmit}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <HomeHeroFloatingLayer
            copy={{
              heroTagA: copy.heroTagA,
              heroTagB: copy.heroTagB,
              heroTagC: copy.heroTagC,
              badgeResource: copy.badgeResource,
              badgeSkill: copy.badgeSkill,
              floatingCardLabel: copy.floatingCardLabel,
              floatingCardTitle: copy.floatingCardTitle,
              floatingCardTagA: copy.floatingCardTagA,
              floatingCardTagB: copy.floatingCardTagB,
              floatingCardTime: copy.floatingCardTime,
              floatingCardUpdated: copy.floatingCardUpdated,
              trending: copy.trending,
              today: copy.today,
              copies: copy.copies,
            }}
            contributorCountLabel={contributorCountLabel}
            todayCopyCountLabel={todayCopyCountLabel}
            heroContributorTones={heroContributorTones}
          />
        </div>
      </section>

      <HomeResourceStream locale={locale} />
    </div>
  )
}

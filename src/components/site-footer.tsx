import Link from "next/link"
import type { Locale } from "@/lib/locale"

type Props = {
  locale: Locale
}

export default function SiteFooter({ locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          description: "面向资源创作者的高品质社区。发布、Remix、收藏，并展示真实视觉效果。",
          product: "产品",
          explore: "探索",
          submit: "投稿",
          trending: "趋势",
          community: "社区",
          remixGallery: "Remix 画廊",
          creators: "创作者",
          collectors: "收藏者",
          resources: "资源",
          brandKit: "品牌素材",
          support: "支持",
          guidelines: "规范",
          rights: "© 2026 Stash. 保留所有权利。",
          privacy: "隐私",
          terms: "条款",
          status: "状态",
          tag1: "编辑感",
          tag2: "极简",
          tag3: "社区",
        }
      : {
          description:
            "A premium community for resource creators. Publish, remix, and collect reusable workflows with real visuals.",
          product: "Product",
          explore: "Explore",
          submit: "Submit",
          trending: "Trending",
          community: "Community",
          remixGallery: "Remix Gallery",
          creators: "Creators",
          collectors: "Collectors",
          resources: "Resources",
          brandKit: "Brand Kit",
          support: "Support",
          guidelines: "Guidelines",
          rights: "© 2026 Stash. All rights reserved.",
          privacy: "Privacy",
          terms: "Terms",
          status: "Status",
          tag1: "Editorial",
          tag2: "Minimal",
          tag3: "Community",
        }

  return (
    <footer className="mt-24 border-t border-border bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-display text-xl text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white shadow-soft">
              C
            </span>
            Stash
          </div>
          <p className="text-sm text-slate-600">{copy.description}</p>
          <div className="flex gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-secondary px-3 py-1">{copy.tag1}</span>
            <span className="rounded-full bg-secondary px-3 py-1">{copy.tag2}</span>
            <span className="rounded-full bg-secondary px-3 py-1">{copy.tag3}</span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-slate-900">{copy.product}</p>
          <Link href="/explore" className="block text-slate-600 hover:text-slate-900">
            {copy.explore}
          </Link>
          <Link href="/submit" className="block text-slate-600 hover:text-slate-900">
            {copy.submit}
          </Link>
          <Link href="/explore" className="block text-slate-600 hover:text-slate-900">
            {copy.trending}
          </Link>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-slate-900">{copy.community}</p>
          <Link href="/" className="block text-slate-600 hover:text-slate-900">
            {copy.remixGallery}
          </Link>
          <Link href="/author/luna-park" className="block text-slate-600 hover:text-slate-900">
            {copy.creators}
          </Link>
          <Link href="/" className="block text-slate-600 hover:text-slate-900">
            {copy.collectors}
          </Link>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-slate-900">{copy.resources}</p>
          <Link href="/" className="block text-slate-600 hover:text-slate-900">
            {copy.brandKit}
          </Link>
          <Link href="/" className="block text-slate-600 hover:text-slate-900">
            {copy.support}
          </Link>
          <Link href="/" className="block text-slate-600 hover:text-slate-900">
            {copy.guidelines}
          </Link>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{copy.rights}</span>
          <div className="flex gap-4">
            <span>{copy.privacy}</span>
            <span>{copy.terms}</span>
            <span>{copy.status}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

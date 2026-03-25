/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowUpRight, Star } from "lucide-react"
import type { Locale } from "@/lib/locale"
import type { ResourceSummary } from "@/types/resource"
import { formatCompact } from "@/lib/format"

const toneMap: Record<ResourceSummary["tone"], string> = {
  sky: "from-[#E8E0FF] via-[#F4F8FF] to-white",
  mint: "from-[#DFF7F1] via-[#F4FFFA] to-white",
  peach: "from-[#FFE1EE] via-[#FFF6FB] to-white",
  ink: "from-[#F1F5F9] via-white to-white",
}

type Props = {
  design?: ResourceSummary
  resource?: ResourceSummary
  locale?: Locale
}

export default function DesignCard({ design, resource, locale = "zh" }: Props) {
  const item = resource || design
  if (!item) return null

  const commentsLabel = locale === "zh" ? "条评论" : " comments"

  return (
    <Link
      href={`/resources/${item.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-soft transition-all duration-[400ms] ease-out hover:-translate-y-1.5 hover:shadow-float"
    >
      <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${toneMap[item.tone]}`}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.05]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/40 to-white/70" />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700 backdrop-blur">
          {item.tags[0] || "Resource"}
        </div>
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>{item.author.name}</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <p className="text-sm text-slate-600">{item.description}</p>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-3 py-1">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-primary" />
            {item.stats.averageRating ? item.stats.averageRating.toFixed(1) : "—"}
          </span>
          <span>
            {formatCompact(item.stats.comments, locale)}
            {commentsLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}

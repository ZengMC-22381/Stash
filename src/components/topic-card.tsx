import type { Topic } from "@/types/design"
import type { Locale } from "@/lib/locale"
import { formatCompact } from "@/lib/format"

const toneMap: Record<Topic["tone"], string> = {
  sky: "from-[#E8E0FF] via-[#F4F8FF] to-white",
  mint: "from-[#DFF7F1] via-[#F4FFFA] to-white",
  peach: "from-[#FFE1EE] via-[#FFF6FB] to-white",
  ink: "from-[#EEF2FF] via-white to-white",
}

type Props = {
  topic: Topic
  locale?: Locale
}

export default function TopicCard({ topic, locale = "zh" }: Props) {
  const designsLabel = locale === "zh" ? "个设计" : " designs"
  const exploreLabel = locale === "zh" ? "浏览分类" : "Explore Topic"

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${toneMap[topic.tone]} p-6 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-float`}
    >
      <div className="absolute right-6 top-6 rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
        {formatCompact(topic.count, locale)}
        {designsLabel}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{topic.title}</h3>
      <p className="mt-2 text-sm text-slate-600">{topic.description}</p>
      <div className="mt-6 inline-flex rounded-full border border-border bg-white/80 px-3 py-1 text-[11px] text-slate-600">
        {exploreLabel}
      </div>
    </div>
  )
}

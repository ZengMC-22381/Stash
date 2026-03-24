import AuthPanel from "@/components/auth-panel"
import SubmitForm from "@/components/submit-form"
import { getServerLocale } from "@/lib/server-locale"

const container = "mx-auto w-full max-w-[1100px] px-6"

export default async function SubmitPage() {
  const locale = await getServerLocale()

  const copy =
    locale === "zh"
      ? {
          section: "投稿",
          title: "发布你的 DESIGN.md",
          subtitle: "上传你的 Prompt 与效果图，让社区快速浏览、收藏与 Remix。",
          guideline: "投稿建议",
          guidelineTitle: "让内容更易 Remix",
          guidelineDesc: "建议使用清晰分节，并明确描述输出布局与风格目标。",
          tip: "创作者提示",
          tipDesc: "添加 2-3 个输出变体，通常会获得更多收藏与 Remix。",
          next: "接下来会发生什么？",
          nextDesc: "你的 DESIGN.md 会即时上线，社区策展人可能将其加入精选。",
        }
      : {
          section: "Submit",
          title: "Publish your DESIGN.md",
          subtitle: "Publish your prompt, attach the output visuals, and let the community remix your work.",
          guideline: "Guidelines",
          guidelineTitle: "Make it remixable",
          guidelineDesc: "Use clear sections and describe the output layout.",
          tip: "Creator Tip",
          tipDesc: "Add 2-3 output variations to increase saves and remixes.",
          next: "What happens next?",
          nextDesc: "Your DESIGN.md goes live instantly. Curators may feature it.",
        }

  return (
    <div className="space-y-12 pb-24 pt-12">
      <section className={container}>
        <div className="mx-auto max-w-[800px] space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.section}</p>
          <h1 className="font-display text-4xl text-slate-900 md:text-5xl">{copy.title}</h1>
          <p className="text-base text-slate-600">{copy.subtitle}</p>
        </div>
      </section>

      <section className={`${container} flex justify-center`}>
        <AuthPanel locale={locale} />
      </section>

      <section className={`${container} flex justify-center`}>
        <SubmitForm locale={locale} />
      </section>

      <section className={`${container} grid gap-6 md:grid-cols-3`}>
        <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.guideline}</p>
          <h2 className="mt-3 font-display text-2xl text-slate-900">{copy.guidelineTitle}</h2>
          <p className="mt-3 text-sm text-slate-600">{copy.guidelineDesc}</p>
        </div>
        <div className="rounded-3xl border border-border bg-gradient-to-br from-[#F8F4FF] via-white to-[#FFF4F8] p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.tip}</p>
          <p className="mt-3 text-sm text-slate-700">{copy.tipDesc}</p>
        </div>
        <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
          <p className="text-sm font-semibold text-slate-700">{copy.next}</p>
          <p className="mt-2 text-sm text-slate-600">{copy.nextDesc}</p>
        </div>
      </section>
    </div>
  )
}

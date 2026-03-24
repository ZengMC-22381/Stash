import Link from "next/link"
import { ArrowRight, MessageSquare } from "lucide-react"
import { getForumThreads } from "@/lib/data"
import { getServerLocale } from "@/lib/server-locale"

const container = "mx-auto w-full max-w-[1100px] px-6"

export default async function ForumPage() {
  const locale = await getServerLocale()
  const threads = await getForumThreads(20)
  const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const copy =
    locale === "zh"
      ? {
          section: "论坛",
          title: "社区讨论",
          subtitle: "查看创作者最新评论与交流，点击可跳转到对应 DESIGN.md 详情页。",
          latest: "最新评论",
          empty: "目前还没有讨论，成为第一位评论者吧。",
          back: "返回首页",
          openDesign: "查看设计稿",
        }
      : {
          section: "Forum",
          title: "Community Discussions",
          subtitle: "Read the latest creator comments and jump to the corresponding DESIGN.md page.",
          latest: "Latest Comments",
          empty: "No discussions yet. Be the first to comment.",
          back: "Back to Home",
          openDesign: "Open Design",
        }

  return (
    <div className="space-y-12 pb-24 pt-12">
      <section className={container}>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.section}</p>
        <h1 className="mt-3 font-display text-4xl text-slate-900 md:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">{copy.subtitle}</p>
      </section>

      <section className={`${container} space-y-8`}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-slate-900">{copy.latest}</h2>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            {copy.back}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {threads.length ? (
          <div className="space-y-4">
            {threads.map((thread) => (
              <article
                key={thread.id}
                className="rounded-3xl border border-border bg-white p-6 shadow-soft transition hover:border-primary/30"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-slate-700">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-slate-800">{thread.author.name}</span>
                    <span className="text-xs text-slate-500">@{thread.author.handle}</span>
                  </div>
                  <span className="text-xs text-slate-500">{formatter.format(thread.createdAt)}</span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-700">{thread.content}</p>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">{thread.design.title}</p>
                  <Link
                    href={`/designs/${thread.design.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-primary"
                  >
                    {copy.openDesign}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-white p-8 text-sm text-slate-600">{copy.empty}</div>
        )}
      </section>
    </div>
  )
}

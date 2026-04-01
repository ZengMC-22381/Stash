/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { getForumListPayload } from "@/lib/data"
import { getServerLocale } from "@/lib/server-locale"

const iconTodayUpdate = "https://www.figma.com/api/mcp/asset/4a0b90f5-29f1-453c-8f5e-c9d3dbc5d37b"
const iconComments = "https://www.figma.com/api/mcp/asset/70194de4-3311-41c6-b852-b47b2f4de2d1"
const iconViews = "https://www.figma.com/api/mcp/asset/fc2e6bac-ed23-45d4-b0d0-3fb70076c876"
const iconLikes = "https://www.figma.com/api/mcp/asset/e0ad3a7a-5400-4476-8680-72ecdf9dff6c"
const iconHotTagsHeading = "https://www.figma.com/api/mcp/asset/3fbbc346-a90a-421a-83a8-5b9654924287"
const iconHotTagItem = "https://www.figma.com/api/mcp/asset/06c6005f-7319-4dde-a945-d1e4cea8b9fd"
const fallbackPreviewImage = "https://www.figma.com/api/mcp/asset/681648b7-a840-4407-8191-20db12985fb3"
const fallbackAuthorAvatar = "https://www.figma.com/api/mcp/asset/fce16c8b-8015-479f-b319-9c3358e28bde"

function formatRelativeTime(date: Date, locale: "zh" | "en") {
  const now = Date.now()
  const diff = now - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) {
    const value = Math.max(1, Math.floor(diff / minute))
    return locale === "zh" ? `${value}分钟前` : `${value}m ago`
  }
  if (diff < day) {
    const value = Math.max(1, Math.floor(diff / hour))
    return locale === "zh" ? `${value}小时前` : `${value}h ago`
  }
  if (diff < day * 7) {
    const value = Math.max(1, Math.floor(diff / day))
    return locale === "zh" ? `${value}天前` : `${value}d ago`
  }
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric" }).format(date)
}

function formatMetric(value: number) {
  if (value < 1000) return String(value)
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value).toLowerCase()
}

export default async function ForumPage() {
  const locale = await getServerLocale()
  const i18n = locale === "zh" ? "zh" : "en"
  const payload = await getForumListPayload(12)

  const copy =
    i18n === "zh"
      ? {
          pageTitle: "Stash 讨论社区",
          subtitle: "在这里、讨论关于设计的一切！",
          today: (count: number) => `今日${count}条更新`,
          communityDynamics: "社区动态",
          activeMembers: "活跃会员",
          hotTags: "热门标签",
          empty: "暂时还没有可展示的讨论内容。",
          defaultExcerpt: "我们正在看到从“原始”极简主义向“有质感”的极简主义转变，重点不再仅仅是空白。",
        }
      : {
          pageTitle: "Stash Community",
          subtitle: "Discuss everything about design here.",
          today: (count: number) => `${count} updates today`,
          communityDynamics: "Community Dynamics",
          activeMembers: "Active Members",
          hotTags: "Hot Tags",
          empty: "No community threads yet.",
          defaultExcerpt: "We are seeing a transition from raw minimalism to tactile minimalism with authority-driven details.",
        }

  return (
    <div className="bg-[#f9f9f9] pb-[80px]">
      <section className="mx-auto w-full max-w-[1280px] px-[48px] pt-[47px]">
        <header className="flex items-end justify-between gap-6">
          <div className="w-full max-w-[576px]">
            <h1 className="text-[48px] font-semibold leading-[48px] tracking-[-1.2px] text-[#2f3334]">{copy.pageTitle}</h1>
            <p className="mt-2 text-[18px] leading-[28px] text-[#5c6060]">{copy.subtitle}</p>
          </div>

          <div className="inline-flex h-[36px] shrink-0 items-center gap-2 rounded-full bg-[#111315] px-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
            <img src={iconTodayUpdate} alt="" className="h-4 w-4" />
            <span className="text-[14px] font-medium leading-5 tracking-[-0.1504px] text-white">
              {copy.today(payload.todayUpdateCount)}
            </span>
          </div>
        </header>

        <div className="mt-16 grid grid-cols-12 gap-8">
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
            {payload.threads.length === 0 ? (
              <div className="rounded-[36px] border border-[rgba(175,178,179,0.1)] bg-white px-6 py-8 text-[16px] text-[#5c6060]">
                {copy.empty}
              </div>
            ) : (
              payload.threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/forum/${thread.slug}`}
                  className="block h-[297px] rounded-[36px] border border-[rgba(175,178,179,0.1)] bg-white px-[17px] py-[25px] transition hover:-translate-y-[1px]"
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {thread.tags.length > 0 ? (
                          thread.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex h-7 items-center rounded-full bg-[#f2f2f2] px-3 text-[14px] font-medium leading-5 text-[#b2b2b2]"
                            >
                              #{tag}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex h-7 items-center rounded-full bg-[#f2f2f2] px-3 text-[14px] font-medium leading-5 text-[#b2b2b2]">
                            #Design
                          </span>
                        )}
                      </div>
                      <span className="pt-[1px] text-[12px] font-medium leading-4 text-[#777b7c]">
                        {formatRelativeTime(thread.createdAt, i18n)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-start gap-3">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <h2
                          className="text-[24px] font-medium leading-8 text-[#2f3334]"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {thread.title}
                        </h2>
                        <p
                          className="mt-4 text-[16px] leading-6 text-[#5c6060]"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {thread.excerpt || copy.defaultExcerpt}
                        </p>
                      </div>
                      <div className="h-[122px] w-[122px] shrink-0 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.1)] p-px">
                        <img
                          src={thread.previewImage || fallbackPreviewImage}
                          alt=""
                          className="h-full w-full rounded-[14px] object-cover"
                        />
                      </div>
                    </div>

                    <div className="mt-auto border-t border-[rgba(175,178,179,0.05)] pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="h-8 w-8 overflow-hidden rounded-full bg-[#eceeee]">
                            <img src={fallbackAuthorAvatar} alt="" className="h-full w-full object-cover" />
                          </span>
                          <span className="pl-3 text-[14px] font-semibold leading-5 text-[#2f3334]">{thread.author.name}</span>
                        </div>

                        <div className="flex items-center text-[12px] font-medium leading-4 text-[rgba(92,96,96,0.6)]">
                          <span className="inline-flex items-center">
                            <img src={iconComments} alt="" className="h-[15px] w-[15px]" />
                            <span className="pl-1.5">{thread.metrics.comments}</span>
                          </span>
                          <span className="inline-flex items-center pl-6">
                            <img src={iconViews} alt="" className="h-[11.25px] w-[16.5px]" />
                            <span className="pl-1.5">{formatMetric(thread.metrics.views)}</span>
                          </span>
                          <span className="inline-flex items-center pl-6">
                            <img src={iconLikes} alt="" className="h-[13.76px] w-[15px]" />
                            <span className="pl-1.5">{thread.metrics.likes}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <aside className="col-span-12 flex flex-col gap-8 lg:col-span-4">
            <section className="rounded-[36px] bg-[#f3f4f4] p-8">
              <h3 className="text-[18px] font-medium leading-7 text-[#2f3334]">{copy.communityDynamics}</h3>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-white p-4">
                  <p className="text-[12px] uppercase leading-4 tracking-[-0.6px] text-[#777b7c]">{copy.activeMembers}</p>
                  <p className="mt-1 text-[24px] font-semibold leading-8 text-[#2f3334]">{formatMetric(payload.activeMemberCount)}</p>
                </div>
              </div>
            </section>

            <section className="h-[374px] overflow-hidden rounded-[36px] border border-[rgba(0,0,0,0.03)] bg-white px-[33px] pb-px pt-[33px]">
              <h3 className="flex h-7 items-center gap-2 text-[18px] font-semibold leading-7 tracking-[-0.4395px] text-[#1a1d1f]">
                <img src={iconHotTagsHeading} alt="" className="h-5 w-5" />
                <span>{copy.hotTags}</span>
              </h3>
              <div className="mt-6 h-[256px] space-y-2">
                {payload.hotTags.map((tag) => (
                  <div key={tag.name} className="inline-flex h-9 items-center gap-2 rounded-full bg-[#f4f5f6] px-4">
                    <img src={iconHotTagItem} alt="" className="h-[14px] w-[14px]" />
                    <span className="text-[14px] font-medium leading-5 tracking-[-0.1504px] text-[#1a1d1f]">{tag.name}</span>
                    <span className="text-[12px] font-medium leading-4 text-[#6b7280]">({tag.count})</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  )
}

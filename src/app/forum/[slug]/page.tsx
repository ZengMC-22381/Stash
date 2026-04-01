/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { notFound } from "next/navigation"
import ForumDetailInteractions from "@/components/forum-detail-interactions"
import { getForumPostDetail } from "@/lib/data"
import { getServerLocale } from "@/lib/server-locale"

const iconBack = "https://www.figma.com/api/mcp/asset/707fb06c-a5ac-4d89-b958-4b639ebe60ad"
const iconDate = "https://www.figma.com/api/mcp/asset/a821459b-894e-419f-b1a2-97d3c74ddd26"
const iconViews = "https://www.figma.com/api/mcp/asset/11d1a678-46da-4f4f-adf1-4ed7e3ff19a0"
const iconComments = "https://www.figma.com/api/mcp/asset/072513fd-f420-49af-a66e-1b855899ba00"
const iconLikes = "https://www.figma.com/api/mcp/asset/01f9e366-a620-4c97-98a5-d04a85988032"
const authorAvatar = "https://www.figma.com/api/mcp/asset/bcdc3167-5469-4376-9ba7-2c130441f0c0"
const fallbackCover = "https://www.figma.com/api/mcp/asset/e056ed4a-9066-42f5-aeae-3578a9f9d9d3"

type PageProps = {
  params: Promise<{ slug: string }>
}

function formatMetric(value: number) {
  if (value < 1000) return String(value)
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value).toLowerCase()
}

export default async function ForumDetailPage({ params }: PageProps) {
  const locale = await getServerLocale()
  const i18n = locale === "zh" ? "zh" : "en"
  const { slug } = await params
  const post = await getForumPostDetail(slug)

  if (!post) notFound()

  const copy =
    i18n === "zh"
      ? {
          back: "返回",
          fallbackTag: "Design",
        }
      : {
          back: "Back",
          fallbackTag: "Design",
        }

  const dateLabel = new Intl.DateTimeFormat(i18n === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(post.createdAt)

  return (
    <div className="bg-[#fafbfc]">
      <div className="border-b border-[rgba(0,0,0,0.03)] bg-[rgba(255,255,255,0.8)]">
        <div className="mx-auto flex h-[57px] w-full max-w-[1279px] items-center px-[126px]">
          <Link href="/forum" className="inline-flex items-center gap-2 text-[14px] font-medium tracking-[-0.1504px] text-[#6b7280]">
            <img src={iconBack} alt="" className="h-4 w-4" />
            <span>{copy.back}</span>
          </Link>
        </div>
      </div>

      <section className="mx-auto w-full max-w-[1280px] px-[126px] pb-[120px] pt-[56px]">
        <div className="flex h-8 flex-wrap gap-2">
          {(post.tags.length > 0 ? post.tags : [copy.fallbackTag]).map((tag) => (
            <span
              key={tag}
              className="inline-flex h-8 items-center rounded-full bg-[#f4f5f6] px-4 text-[14px] font-medium leading-5 tracking-[-0.1504px] text-[#1a1d1f]"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="mt-6 text-[48px] font-semibold leading-[60px] tracking-[-0.8484px] text-[#1a1d1f]">{post.title}</h1>

        <div className="mt-6 flex h-[104px] items-center justify-between rounded-[48px] px-6">
          <div className="flex items-center gap-4">
            <img src={authorAvatar} alt="" className="h-14 w-14 rounded-full object-cover" />
            <div>
              <p className="text-[18px] font-semibold leading-7 tracking-[-0.4395px] text-[#1a1d1f]">{post.author.name}</p>
              <div className="mt-0.5 inline-flex items-center gap-2 text-[14px] leading-5 tracking-[-0.1504px] text-[#6b7280]">
                <img src={iconDate} alt="" className="h-4 w-4" />
                <span>{dateLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[14px] leading-5 tracking-[-0.1504px] text-[#6b7280]">
            <span className="inline-flex items-center gap-2">
              <img src={iconViews} alt="" className="h-5 w-5" />
              <span>{formatMetric(post.metrics.views)}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <img src={iconComments} alt="" className="h-5 w-5" />
              <span>{post.metrics.comments}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <img src={iconLikes} alt="" className="h-5 w-5" />
              <span>{post.metrics.likes}</span>
            </span>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px]">
          <img src={post.coverImage || fallbackCover} alt="" className="h-[400px] w-full object-cover" />
        </div>

        <article className="mt-6 min-h-[500px] pt-[26px]">
          <div className="max-w-[1018px] whitespace-pre-wrap text-[16px] leading-[26px] tracking-[-0.3125px] text-[#1a1d1f]">
            {post.content}
          </div>
        </article>

        <ForumDetailInteractions
          slug={post.slug}
          locale={locale}
          initialLikeCount={post.metrics.likes}
          initialComments={post.comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt.toISOString(),
            author: {
              id: comment.author.id,
              name: comment.author.name,
              handle: comment.author.handle,
            },
          }))}
        />
      </section>
    </div>
  )
}

"use client"

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Locale } from "@/lib/locale"

const iconLike = "https://www.figma.com/api/mcp/asset/e48c369d-7b12-43ba-9f30-b2bff4773296"
const iconShare = "https://www.figma.com/api/mcp/asset/d51d0933-26c5-4d0c-b184-bd1a28d87f5e"
const iconSort = "https://www.figma.com/api/mcp/asset/487eeadd-858c-4824-a38a-c0d3cc06a904"
const iconSend = "https://www.figma.com/api/mcp/asset/c76a3414-9718-4dba-aa05-d6a0a345ec06"
const avatarCurrentUser = "https://www.figma.com/api/mcp/asset/70c48e5e-667f-482c-b7a9-91c2a117a887"
const avatarFallbackA = "https://www.figma.com/api/mcp/asset/49af57d9-35d0-4166-bc3b-a9b447a7c309"
const avatarFallbackB = "https://www.figma.com/api/mcp/asset/e0be39b6-7fa2-4eb1-b39e-42c3ecdb184a"
const avatarReplyA = "https://www.figma.com/api/mcp/asset/cbf53c64-b44d-4369-94ea-8cd070a3a175"
const avatarReplyB = "https://www.figma.com/api/mcp/asset/aa179fc5-aa57-4516-94f3-3bb38b4d5dcf"
const iconRepliesChevron = "https://www.figma.com/api/mcp/asset/3d59f040-120d-4604-b9c0-ded2efbdf109"

type CommentItem = {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    handle: string
  }
}

type Props = {
  slug: string
  locale: Locale
  initialComments: CommentItem[]
  initialLikeCount: number
}

function formatRelativeTime(input: string, locale: "zh" | "en") {
  const date = new Date(input)
  const diff = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  if (diff < hour) {
    const value = Math.max(1, Math.floor(diff / minute))
    return locale === "zh" ? `${value}分钟前` : `${value}m ago`
  }
  if (diff < 24 * hour) {
    const value = Math.max(1, Math.floor(diff / hour))
    return locale === "zh" ? `${value}小时前` : `${value}h ago`
  }
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

export default function ForumDetailInteractions({ slug, locale, initialComments, initialLikeCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const i18n = locale === "zh" ? "zh" : "en"

  const copy =
    i18n === "zh"
      ? {
          like: "点赞",
          share: "分享",
          latest: "最新",
          comments: "评论",
          placeholder: "分享你的想法...",
          submit: "发表评论",
          submitting: "发布中...",
          signInRequired: "登录后即可参与评论与点赞。",
          empty: "还没有评论，来发布第一条评论吧。",
          shareDone: "链接已复制",
          actionFailed: "操作失败，请稍后重试。",
        }
      : {
          like: "Like",
          share: "Share",
          latest: "Latest",
          comments: "Comments",
          placeholder: "Share your thoughts...",
          submit: "Post comment",
          submitting: "Posting...",
          signInRequired: "Sign in to comment and like.",
          empty: "No comments yet. Start the discussion.",
          shareDone: "Link copied",
          actionFailed: "Action failed. Please try again.",
        }

  const [comments, setComments] = useState<CommentItem[]>(initialComments)
  const [input, setInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [meRes, likesRes] = await Promise.all([fetch("/api/auth/me"), fetch(`/api/resources/${slug}/likes`)])
        if (!cancelled && meRes.ok) {
          const data = await meRes.json()
          setUser(data.user || null)
        }
        if (!cancelled && likesRes.ok) {
          const data = await likesRes.json()
          setLiked(Boolean(data.liked))
          if (typeof data.total === "number") {
            setLikeCount(data.total)
          }
        }
      } catch {
        // ignore bootstrapping failure
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [slug])

  const ensureAuth = () => {
    if (user) return true
    const next = pathname || `/forum/${slug}`
    router.push(`/login?next=${encodeURIComponent(next)}`)
    return false
  }

  const handleLike = async () => {
    setMessage(null)
    if (!ensureAuth()) return

    try {
      const response = await fetch(`/api/resources/${slug}/likes`, {
        method: liked ? "DELETE" : "POST",
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || copy.actionFailed)
        return
      }
      setLiked(Boolean(data.liked))
      if (typeof data.total === "number") {
        setLikeCount(data.total)
      }
    } catch {
      setMessage(copy.actionFailed)
    }
  }

  const handleShare = async () => {
    setMessage(null)
    try {
      const shareUrl = typeof window !== "undefined" ? window.location.href : `/forum/${slug}`
      if (navigator.share) {
        await navigator.share({ url: shareUrl })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        throw new Error("no_clipboard")
      }
      setMessage(copy.shareDone)
    } catch {
      setMessage(copy.actionFailed)
    }
  }

  const handleSubmitComment = async () => {
    const value = input.trim()
    if (!value || submitting) return
    setMessage(null)
    if (!ensureAuth()) {
      setMessage(copy.signInRequired)
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/resources/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value }),
      })
      const data = await response.json()
      if (response.status === 401) {
        ensureAuth()
        return
      }
      if (!response.ok) {
        setMessage(data.error || copy.actionFailed)
        return
      }

      const newComment = data.comment as CommentItem
      setComments((prev) => [newComment, ...prev])
      setInput("")
    } catch {
      setMessage(copy.actionFailed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-6 flex flex-col gap-6">
      <div className="flex h-[98px] items-center justify-between rounded-[48px] border border-[rgba(0,0,0,0.06)] bg-[rgba(255,255,255,0.9)] px-[25px] py-[1px]">
        <Button variant="unstyled"
          type="button"
          onClick={handleLike}
          className="inline-flex h-12 items-center gap-[10px] rounded-[32px] bg-[#f4f5f6] px-6"
        >
          <img src={iconLike} alt="" className="h-5 w-5" />
          <span className="text-[16px] font-medium leading-6 tracking-[-0.3125px] text-[#1a1d1f]">{copy.like}</span>
          <span className="text-[14px] font-medium leading-5 tracking-[-0.1504px] text-[#1a1d1f] opacity-75">
            ({likeCount})
          </span>
        </Button>

        <Button variant="unstyled"
          type="button"
          onClick={handleShare}
          className="inline-flex h-12 items-center gap-2 rounded-[32px] bg-[#f4f5f6] px-6"
        >
          <img src={iconShare} alt="" className="h-5 w-5" />
          <span className="text-[16px] font-medium leading-6 tracking-[-0.3125px] text-[#1a1d1f]">{copy.share}</span>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[30px] font-bold leading-9 tracking-[0.0955px] text-[#1a1d1f]">
          {copy.comments} <span className="text-[#6b7280]">({comments.length})</span>
        </h2>
        <Button variant="unstyled" type="button" className="inline-flex h-9 items-center gap-2 rounded-[32px] bg-[#f4f5f6] px-4">
          <span className="text-[14px] font-medium leading-5 tracking-[-0.1504px] text-[#1a1d1f]">{copy.latest}</span>
          <img src={iconSort} alt="" className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-[24px] border border-[rgba(0,0,0,0.03)] bg-white px-[25px] py-4">
        <div className="flex items-start gap-4">
          <img src={avatarCurrentUser} alt="" className="h-10 w-10 rounded-full object-cover" />
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={copy.placeholder}
            className="h-[100px] w-full resize-none rounded-[24px] bg-[#f4f5f6] px-6 py-4 text-[14px] leading-5 tracking-[-0.1504px] text-[#1a1d1f] outline-none placeholder:text-[#6b7280]"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="unstyled"
            type="button"
            onClick={handleSubmitComment}
            disabled={!input.trim() || submitting}
            className="inline-flex h-12 w-[136px] items-center justify-center gap-2 rounded-2xl bg-[#111315] text-white disabled:opacity-50"
          >
            <img src={iconSend} alt="" className="h-4 w-4" />
            <span className="text-[16px] font-medium leading-6 tracking-[-0.3125px]">
              {submitting ? copy.submitting : copy.submit}
            </span>
          </Button>
        </div>
      </div>

      {message ? <p className="text-[14px] text-[#6b7280]">{message}</p> : null}

      <div className="flex flex-col gap-4 px-6 py-3">
        {comments.length === 0 ? (
          <div className="rounded-[20px] bg-white px-6 py-6 text-[14px] text-[#6b7280]">{copy.empty}</div>
        ) : (
          comments.map((comment, index) => (
            <article key={comment.id} className="py-1">
              <div className="flex items-start gap-3">
                <img
                  src={index % 2 === 0 ? avatarFallbackA : avatarFallbackB}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[16px] font-semibold leading-6 tracking-[-0.3125px] text-[#1a1d1f]">{comment.author.name}</p>
                    <p className="text-[14px] leading-5 tracking-[-0.1504px] text-[#6b7280]">{formatRelativeTime(comment.createdAt, i18n)}</p>
                  </div>
                  <p className="mt-1 text-[16px] leading-[26px] tracking-[-0.3125px] text-[#1a1d1f]">{comment.content}</p>

                  <div className="mt-3 flex items-center gap-[6px]">
                    <span className="inline-flex h-7 items-center gap-[6px] rounded-full bg-[#f4f5f6] px-[10px] text-[14px] font-medium text-[#6b7280]">
                      ❤️ <span>2</span>
                    </span>
                    <span className="inline-flex h-7 items-center gap-[6px] rounded-full bg-[rgba(17,19,21,0.1)] px-[10px] text-[14px] font-medium text-[#111315]">
                      👍 <span>6</span>
                    </span>
                    <span className="inline-flex h-7 items-center gap-[6px] rounded-full bg-[#f4f5f6] px-[10px] text-[14px] font-medium text-[#6b7280]">
                      👏 <span>1</span>
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f4f5f6] text-[14px] font-medium text-[#6b7280]">
                      +
                    </span>
                  </div>

                  {index === 0 ? (
                    <div className="mt-3 inline-flex h-6 items-center gap-2">
                      <span className="relative h-6 w-10">
                        <img src={avatarReplyA} alt="" className="absolute left-0 top-0 h-6 w-6 rounded-full object-cover shadow-[0_0_0_2px_#fafbfc]" />
                        <img src={avatarReplyB} alt="" className="absolute left-4 top-0 h-6 w-6 rounded-full object-cover shadow-[0_0_0_2px_#fafbfc]" />
                      </span>
                      <span className="text-[14px] font-medium leading-5 tracking-[-0.1504px] text-[#111315]">
                        5 replies from Clive Bixby, Seb Johanssen
                      </span>
                      <img src={iconRepliesChevron} alt="" className="h-4 w-4" />
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

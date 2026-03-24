"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { formatCompact } from "@/lib/format"
import type { Locale } from "@/lib/locale"

interface CommentItem {
  id: string
  content: string
  createdAt: string
  author: {
    name: string
    handle: string
  }
}

type Props = {
  slug: string
  locale: Locale
}

export default function DesignEngagement({ slug, locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          section: "社区互动",
          title: "评分与反馈",
          avg: "平均评分",
          ratings: "个评分",
          signInComment: "请先登录后再评论。",
          commentFailed: "评论发布失败。",
          signInRate: "请先登录后再评分。",
          ratingFailed: "评分提交失败。",
          rateHint: "点击星星即可评分",
          rateNeedSignIn: "登录后可评分",
          commentPlaceholder: "分享你的反馈或问题",
          postComment: "发布评论",
          signInTip: "请先登录后再评分或评论。",
          emptyComment: "还没有评论，来发表第一条反馈吧。",
        }
      : {
          section: "Community",
          title: "Ratings & Feedback",
          avg: "Average rating",
          ratings: "ratings",
          signInComment: "Please sign in to comment.",
          commentFailed: "Unable to post comment.",
          signInRate: "Please sign in to rate.",
          ratingFailed: "Unable to submit rating.",
          rateHint: "Click a star to rate",
          rateNeedSignIn: "Sign in to rate",
          commentPlaceholder: "Share feedback or questions",
          postComment: "Post comment",
          signInTip: "Please sign in to rate or comment.",
          emptyComment: "No comments yet. Be the first to share feedback.",
        }

  const [comments, setComments] = useState<CommentItem[]>([])
  const [rating, setRating] = useState({ average: 0, total: 0 })
  const [newComment, setNewComment] = useState("")
  const [myRating, setMyRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [user, setUser] = useState<{ name: string } | null>(null)

  const load = async () => {
    const [commentsRes, ratingsRes] = await Promise.all([
      fetch(`/api/designs/${slug}/comments`),
      fetch(`/api/designs/${slug}/ratings`),
    ])

    if (commentsRes.ok) {
      const data = await commentsRes.json()
      setComments(data.comments || [])
    }

    if (ratingsRes.ok) {
      const data = await ratingsRes.json()
      setRating({
        average: data.averageRating || 0,
        total: data.totalRatings || 0,
      })
      setMyRating(typeof data.myRating === "number" ? data.myRating : null)
    }
  }

  useEffect(() => {
    setMessage(null)
    load()
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch {
        // ignore
      }
    }
    loadUser()
  }, [slug])

  const submitComment = async () => {
    setMessage(null)
    if (!user) {
      setMessage(copy.signInComment)
      return
    }
    const res = await fetch(`/api/designs/${slug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || copy.commentFailed)
      return
    }
    setNewComment("")
    setComments((prev) => [data.comment, ...prev])
  }

  const submitRating = async (value: number) => {
    setMessage(null)
    if (!user) {
      setMessage(copy.signInRate)
      return
    }
    const res = await fetch(`/api/designs/${slug}/ratings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    })
    const data = await res.json()
    if (!res.ok) {
      setMessage(data.error || copy.ratingFailed)
      return
    }
    setRating({ average: data.averageRating || 0, total: data.totalRatings || 0 })
    setMyRating(value)
  }

  return (
    <section className="rounded-3xl border border-border bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.section}</p>
          <h2 className="mt-3 font-display text-2xl text-slate-900">{copy.title}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {copy.avg} {rating.average.toFixed(1)} · {formatCompact(rating.total, locale)}
            {copy.ratings}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1
              const filled = (hoverRating ?? myRating ?? rating.average) >= value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => submitRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(null)}
                  disabled={!user}
                  className="rounded-full p-1 disabled:cursor-not-allowed"
                  aria-label={locale === "zh" ? `评分 ${value} 星` : `Rate ${value} stars`}
                >
                  <Star
                    className={`h-4 w-4 ${filled ? "text-primary" : "text-slate-300"}`}
                    fill={filled ? "currentColor" : "none"}
                  />
                </button>
              )
            })}
          </div>
          <span className="text-xs text-slate-500">{user ? copy.rateHint : copy.rateNeedSignIn}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder={copy.commentPlaceholder}
          className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          disabled={!user}
        />
        <button
          onClick={submitComment}
          disabled={!user}
          className="inline-flex h-10 items-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-slate-700 disabled:opacity-50"
        >
          {copy.postComment}
        </button>
        {!user ? (
          <p className="text-sm text-slate-500">{copy.signInTip}</p>
        ) : null}
        {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      </div>

      <div className="mt-8 space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">{copy.emptyComment}</p>
        ) : (
          comments.map((comment) => {
            const initials = comment.author.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
            return (
              <div key={comment.id} className="rounded-2xl border border-border bg-muted px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97] text-xs font-semibold text-white">
                    {initials}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      {comment.author.name} · @{comment.author.handle}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700">{comment.content}</p>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

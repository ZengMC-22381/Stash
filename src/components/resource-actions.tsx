"use client"

import { useEffect, useState } from "react"
import { Bookmark, Heart, Share2 } from "lucide-react"
import type { Locale } from "@/lib/locale"

type Props = {
  slug: string
  locale: Locale
}

export default function ResourceActions({ slug, locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          like: "点赞",
          liked: "已点赞",
          save: "收藏",
          saved: "已收藏",
          share: "分享",
          shared: "已分享",
          likeFailed: "点赞失败，请稍后重试。",
          saveFailed: "收藏失败，请稍后重试。",
          shareFailed: "分享失败，请稍后重试。",
          shareSuccess: "链接已复制，快去分享吧。",
          signInLike: "请先登录后再点赞资源。",
          signInSave: "请先登录后再收藏资源。",
        }
      : {
          like: "Like",
          liked: "Liked",
          save: "Save",
          saved: "Saved",
          share: "Share",
          shared: "Shared",
          likeFailed: "Unable to update like state.",
          saveFailed: "Unable to update save state.",
          shareFailed: "Unable to share this resource.",
          shareSuccess: "Link copied and ready to share.",
          signInLike: "Please sign in to like this resource.",
          signInSave: "Please sign in to save this resource.",
        }

  const [user, setUser] = useState<{ id: string } | null>(null)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeTotal, setLikeTotal] = useState<number | null>(null)
  const [saveTotal, setSaveTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [shareState, setShareState] = useState<"idle" | "shared">("idle")

  useEffect(() => {
    setMessage(null)
    const load = async () => {
      try {
        const [meRes, likeRes, bookmarkRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/resources/${slug}/likes`),
          fetch(`/api/resources/${slug}/bookmark`),
        ])

        if (meRes.ok) {
          const data = await meRes.json()
          setUser(data.user || null)
        } else {
          setUser(null)
        }

        if (likeRes.ok) {
          const data = await likeRes.json()
          setLiked(Boolean(data.liked))
          setLikeTotal(typeof data.total === "number" ? data.total : null)
        }

        if (bookmarkRes.ok) {
          const data = await bookmarkRes.json()
          setSaved(Boolean(data.saved))
          setSaveTotal(typeof data.total === "number" ? data.total : null)
        }
      } catch {
        // ignore loading failures
      }
    }

    load()
  }, [slug])

  const handleLike = async () => {
    setMessage(null)
    if (!user) {
      setMessage(copy.signInLike)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/resources/${slug}/likes`, { method: liked ? "DELETE" : "POST" })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || copy.likeFailed)
        return
      }
      setLiked(Boolean(data.liked))
      setLikeTotal(typeof data.total === "number" ? data.total : null)
    } catch {
      setMessage(copy.likeFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setMessage(null)
    if (!user) {
      setMessage(copy.signInSave)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/resources/${slug}/bookmark`, { method: saved ? "DELETE" : "POST" })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || copy.saveFailed)
        return
      }
      setSaved(Boolean(data.saved))
      setSaveTotal(typeof data.total === "number" ? data.total : null)
    } catch {
      setMessage(copy.saveFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    setMessage(null)
    const url = typeof window !== "undefined" ? window.location.href : `/resources/${slug}`

    try {
      if (navigator.share) {
        await navigator.share({ url })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        setMessage(copy.shareSuccess)
      } else {
        throw new Error("clipboard_unavailable")
      }

      setShareState("shared")
      setTimeout(() => setShareState("idle"), 1800)
    } catch {
      setMessage(copy.shareFailed)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleLike}
          disabled={loading}
          className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${
            liked
              ? "border-[#2f3334] bg-[#2f3334] text-white"
              : "border-[rgba(209,209,209,1)] bg-white text-[#333333] hover:border-[#2f3334]"
          }`}
          aria-label={liked ? copy.liked : copy.like}
        >
          <Heart className="h-3.5 w-3.5" />
          <span>{liked ? copy.liked : copy.like}</span>
          {typeof likeTotal === "number" ? <span className="text-[11px] opacity-75">{likeTotal}</span> : null}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${
            saved
              ? "border-[#2f3334] bg-[#2f3334] text-white"
              : "border-[rgba(209,209,209,1)] bg-white text-[#333333] hover:border-[#2f3334]"
          }`}
          aria-label={saved ? copy.saved : copy.save}
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>{saved ? copy.saved : copy.save}</span>
          {typeof saveTotal === "number" ? <span className="text-[11px] opacity-75">{saveTotal}</span> : null}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[rgba(209,209,209,1)] bg-white px-3 text-xs font-semibold text-[#333333] transition hover:border-[#2f3334]"
          aria-label={shareState === "shared" ? copy.shared : copy.share}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>{shareState === "shared" ? copy.shared : copy.share}</span>
        </button>
      </div>

      {message ? <p className="text-xs text-[#71717a]">{message}</p> : null}
    </div>
  )
}

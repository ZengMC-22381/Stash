"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, Copy, Heart, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Locale } from "@/lib/locale"

type Props = {
  slug: string
  content: string
  locale: Locale
}

export default function DesignActions({ slug, content, locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          signInLike: "请先登录后再点赞资源。",
          likeFailed: "点赞状态更新失败。",
          signInSave: "请先登录后再收藏资源。",
          saveFailed: "收藏状态更新失败。",
          copySuccess: "已复制资源内容。",
          copyFailed: "复制失败，请重试。",
          signInRemix: "请先登录后再 Remix。",
          remixFailed: "Remix 失败。",
          remixed: "Remix 已创建。",
          liked: "已点赞",
          like: "点赞",
          saved: "已收藏",
          save: "收藏",
          copied: "已复制",
          copy: "复制",
          remix: "Remix",
        }
      : {
          signInLike: "Please sign in to like this resource.",
          likeFailed: "Unable to update like state.",
          signInSave: "Please sign in to save this resource.",
          saveFailed: "Unable to update save state.",
          copySuccess: "Copied resource content.",
          copyFailed: "Copy failed. Try again.",
          signInRemix: "Please sign in to remix.",
          remixFailed: "Unable to remix.",
          remixed: "Remix created.",
          liked: "Liked",
          like: "Like",
          saved: "Saved",
          save: "Save",
          copied: "Copied",
          copy: "Copy",
          remix: "Remix",
        }

  const router = useRouter()
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [saved, setSaved] = useState(false)
  const [saveTotal, setSaveTotal] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)
  const [likeTotal, setLikeTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")

  useEffect(() => {
    setMessage(null)
    const load = async () => {
      try {
        const [meRes, bookmarkRes, likeRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch(`/api/resources/${slug}/bookmark`),
          fetch(`/api/resources/${slug}/likes`),
        ])

        if (meRes.ok) {
          const data = await meRes.json()
          setUser(data.user || null)
        } else {
          setUser(null)
        }

        if (bookmarkRes.ok) {
          const data = await bookmarkRes.json()
          setSaved(Boolean(data.saved))
          setSaveTotal(typeof data.total === "number" ? data.total : null)
        }

        if (likeRes.ok) {
          const data = await likeRes.json()
          setLiked(Boolean(data.liked))
          setLikeTotal(typeof data.total === "number" ? data.total : null)
        }
      } catch {
        // ignore
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
      const res = await fetch(`/api/resources/${slug}/likes`, { method: liked ? "DELETE" : "POST" })
      const data = await res.json()
      if (!res.ok) {
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
      const res = await fetch(`/api/resources/${slug}/bookmark`, { method: saved ? "DELETE" : "POST" })
      const data = await res.json()
      if (!res.ok) {
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

  const handleCopy = async () => {
    setMessage(null)
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = content
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      try {
        await fetch("/api/copies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        })
      } catch {
        // ignore tracking failures
      }
      setCopyState("copied")
      setMessage(copy.copySuccess)
      setTimeout(() => setCopyState("idle"), 2000)
    } catch {
      setMessage(copy.copyFailed)
    }
  }

  const handleRemix = async () => {
    setMessage(null)
    if (!user) {
      setMessage(copy.signInRemix)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/resources/${slug}/remix`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || copy.remixFailed)
        return
      }
      const remixSlug = data.resource?.slug || data.design?.slug
      if (remixSlug) {
        router.push(`/resources/${remixSlug}`)
        return
      }
      setMessage(copy.remixed)
    } catch {
      setMessage(copy.remixFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Button variant="unstyled"
          type="button"
          onClick={handleLike}
          disabled={loading}
          className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition ${
            liked ? "border-primary bg-primary text-white" : "border-border bg-white text-slate-600 hover:border-primary"
          }`}
        >
          <Heart className="h-4 w-4" />
          {liked ? copy.liked : copy.like}
          {typeof likeTotal === "number" ? <span className="ml-1 text-[11px] opacity-80">{likeTotal}</span> : null}
        </Button>
        <Button variant="unstyled"
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition ${
            saved ? "border-primary bg-primary text-white" : "border-border bg-white text-slate-600 hover:border-primary"
          }`}
        >
          <Bookmark className="h-4 w-4" />
          {saved ? copy.saved : copy.save}
          {typeof saveTotal === "number" ? <span className="ml-1 text-[11px] opacity-80">{saveTotal}</span> : null}
        </Button>
        <Button variant="unstyled"
          type="button"
          onClick={handleCopy}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-semibold text-slate-600 hover:border-primary"
        >
          <Copy className="h-4 w-4" />
          {copyState === "copied" ? copy.copied : copy.copy}
        </Button>
        <Button variant="unstyled"
          type="button"
          onClick={handleRemix}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-white shadow-float"
        >
          <Layers className="h-4 w-4" />
          {copy.remix}
        </Button>
      </div>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  )
}

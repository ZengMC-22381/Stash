"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, Heart, Layers } from "lucide-react"
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
          signInSave: "请先登录后再收藏 DESIGN.md。",
          saveFailed: "收藏状态更新失败。",
          copySuccess: "已复制 DESIGN.md 内容。",
          copyFailed: "复制失败，请重试。",
          signInRemix: "请先登录后再 Remix。",
          remixFailed: "Remix 失败。",
          remixed: "Remix 已创建。",
          saved: "已收藏",
          save: "收藏",
          copied: "已复制",
          copy: "复制",
          remix: "Remix",
        }
      : {
          signInSave: "Please sign in to save this DESIGN.md.",
          saveFailed: "Unable to update save.",
          copySuccess: "Copied DESIGN.md content.",
          copyFailed: "Copy failed. Try again.",
          signInRemix: "Please sign in to remix.",
          remixFailed: "Unable to remix.",
          remixed: "Remix created.",
          saved: "Saved",
          save: "Save",
          copied: "Copied",
          copy: "Copy",
          remix: "Remix",
        }

  const router = useRouter()
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [saved, setSaved] = useState(false)
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")

  useEffect(() => {
    setMessage(null)
    const load = async () => {
      try {
        const [meRes, bookmarkRes] = await Promise.all([fetch("/api/auth/me"), fetch(`/api/designs/${slug}/bookmark`)])
        if (meRes.ok) {
          const data = await meRes.json()
          setUser(data.user || null)
        } else {
          setUser(null)
        }
        if (bookmarkRes.ok) {
          const data = await bookmarkRes.json()
          setSaved(Boolean(data.saved))
          setTotal(typeof data.total === "number" ? data.total : null)
        }
      } catch {
        // ignore
      }
    }
    load()
  }, [slug])

  const handleSave = async () => {
    setMessage(null)
    if (!user) {
      setMessage(copy.signInSave)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/designs/${slug}/bookmark`, { method: saved ? "DELETE" : "POST" })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || copy.saveFailed)
        return
      }
      setSaved(Boolean(data.saved))
      setTotal(typeof data.total === "number" ? data.total : null)
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
      const res = await fetch(`/api/designs/${slug}/remix`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || copy.remixFailed)
        return
      }
      if (data.design?.slug) {
        router.push(`/designs/${data.design.slug}`)
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
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition ${
            saved
              ? "border-primary bg-primary text-white"
              : "border-border bg-white text-slate-600 hover:border-primary"
          }`}
        >
          <Heart className="h-4 w-4" />
          {saved ? copy.saved : copy.save}
          {typeof total === "number" ? <span className="ml-1 text-[11px] opacity-80">{total}</span> : null}
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-xs font-semibold text-slate-600 hover:border-primary"
        >
          <Copy className="h-4 w-4" />
          {copyState === "copied" ? copy.copied : copy.copy}
        </button>
        <button
          type="button"
          onClick={handleRemix}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-white shadow-float"
        >
          <Layers className="h-4 w-4" />
          {copy.remix}
        </button>
      </div>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
    </div>
  )
}

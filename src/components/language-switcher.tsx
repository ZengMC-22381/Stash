"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import type { Locale } from "@/lib/locale"

type Props = {
  locale: Locale
}

export default function LanguageSwitcher({ locale }: Props) {
  const router = useRouter()
  const [pendingLocale, setPendingLocale] = useState<Locale>(locale)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setPendingLocale(locale)
  }, [locale])

  const switchLocale = (nextLocale: Locale) => {
    if (isPending || nextLocale === pendingLocale) return

    setPendingLocale(nextLocale)
    startTransition(async () => {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      })
      router.refresh()
    })
  }

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-white p-1 text-xs font-semibold text-slate-600 shadow-soft">
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchLocale("zh")}
        className={`rounded-full px-3 py-1 transition ${pendingLocale === "zh" ? "bg-primary text-white" : "text-slate-600"}`}
      >
        中文
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => switchLocale("en")}
        className={`rounded-full px-3 py-1 transition ${pendingLocale === "en" ? "bg-primary text-white" : "text-slate-600"}`}
      >
        EN
      </button>
    </div>
  )
}

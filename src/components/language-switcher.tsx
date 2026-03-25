"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import type { Locale } from "@/lib/locale"

type Props = {
  locale: Locale
  variant?: "default" | "segmented" | "header"
}

function merge(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export default function LanguageSwitcher({ locale, variant = "default" }: Props) {
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

  if (variant === "segmented") {
    return (
      <div className="inline-flex h-full items-center rounded-full border border-[rgba(175,178,179,0.1)] bg-[rgba(243,244,244,0.5)] p-[5px]">
        <button
          type="button"
          disabled={isPending}
          onClick={() => switchLocale("zh")}
          className={merge(
            "rounded-full px-3 py-1 text-[12px] font-semibold leading-4 transition",
            pendingLocale === "zh"
              ? "bg-[#615b7c] text-white"
              : "text-[#5c6060] hover:text-[#2f3334]"
          )}
        >
          CN
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => switchLocale("en")}
          className={merge(
            "rounded-full px-3 py-1 text-[12px] font-semibold leading-4 transition",
            pendingLocale === "en"
              ? "bg-[#615b7c] text-white"
              : "text-[#5c6060] hover:text-[#2f3334]"
          )}
        >
          EN
        </button>
      </div>
    )
  }

  if (variant === "header") {
    return (
      <div className="inline-flex items-center rounded-full border border-[#e4e4e7] bg-white p-[5px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.02)]">
        <button
          type="button"
          disabled={isPending}
          onClick={() => switchLocale("zh")}
          className={merge(
            "h-6 rounded-full px-3 text-[12px] font-semibold leading-4 transition",
            pendingLocale === "zh"
              ? "bg-[#7847ff] text-white"
              : "text-[#475569] hover:text-[#334155]"
          )}
        >
          中文
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => switchLocale("en")}
          className={merge(
            "h-6 rounded-full px-3 text-[12px] font-semibold leading-4 transition",
            pendingLocale === "en"
              ? "bg-[#7847ff] text-white"
              : "text-[#475569] hover:text-[#334155]"
          )}
        >
          EN
        </button>
      </div>
    )
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

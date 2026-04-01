"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
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
        <Button variant="unstyled"
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
        </Button>
        <Button variant="unstyled"
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
        </Button>
      </div>
    )
  }

  if (variant === "header") {
    return (
      <div className="inline-flex h-9 items-center rounded-full bg-[#f3f4f4] p-1">
        <Button variant="unstyled"
          type="button"
          disabled={isPending}
          onClick={() => switchLocale("zh")}
          aria-label="Switch to Chinese"
          className={merge(
            "inline-flex h-7 min-w-[48px] items-center justify-center rounded-full px-3 text-[16px] leading-4 transition",
            pendingLocale === "zh"
              ? "bg-white text-[#2f3334] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
              : "text-[#475569] hover:text-[#2f3334]"
          )}
        >
          🇨🇳
        </Button>
        <Button variant="unstyled"
          type="button"
          disabled={isPending}
          onClick={() => switchLocale("en")}
          aria-label="Switch to English"
          className={merge(
            "inline-flex h-7 min-w-[54px] items-center justify-center rounded-full px-3 text-[16px] leading-4 transition",
            pendingLocale === "en"
              ? "bg-white text-[#2f3334] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
              : "text-[#475569] hover:text-[#2f3334]"
          )}
        >
          🇬🇧
        </Button>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-white p-1 text-xs font-semibold text-slate-600 shadow-soft">
      <Button variant="unstyled"
        type="button"
        disabled={isPending}
        onClick={() => switchLocale("zh")}
        className={`rounded-full px-3 py-1 transition ${pendingLocale === "zh" ? "bg-primary text-white" : "text-slate-600"}`}
      >
        中文
      </Button>
      <Button variant="unstyled"
        type="button"
        disabled={isPending}
        onClick={() => switchLocale("en")}
        className={`rounded-full px-3 py-1 transition ${pendingLocale === "en" ? "bg-primary text-white" : "text-slate-600"}`}
      >
        EN
      </Button>
    </div>
  )
}

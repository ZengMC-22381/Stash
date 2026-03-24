import type { Locale } from "@/lib/locale"

export function formatCompact(value: number, locale: Locale = "zh") {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

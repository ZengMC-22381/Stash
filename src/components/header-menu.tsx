"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Locale } from "@/lib/locale"

type Props = {
  locale: Locale
  mobile?: boolean
  className?: string
  variant?: "default" | "segmented" | "header"
}

function merge(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export default function HeaderMenu({ locale, mobile = false, className, variant = "default" }: Props) {
  const pathname = usePathname()
  const items =
    locale === "zh"
      ? [
          { href: "/", label: "首页" },
          { href: "/#directory-filter", label: "发现" },
          { href: "/forum", label: "论坛" },
        ]
      : [
          { href: "/", label: "Home" },
          { href: "/#directory-filter", label: "Discover" },
          { href: "/forum", label: "Forum" },
        ]

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  if (variant === "segmented") {
    return (
      <nav
        className={merge(
          "inline-flex h-full items-center rounded-full border border-[rgba(175,178,179,0.1)] bg-[rgba(243,244,244,0.5)] p-[5px]",
          className
        )}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={merge(
              "rounded-full px-6 py-2 text-[14px] font-bold leading-5 transition",
              isActive(item.href)
                ? "bg-white text-[#615b7c] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                : "text-[#5c6060] hover:text-[#2f3334]"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    )
  }

  if (variant === "header") {
    return (
      <nav className={merge("inline-flex h-full items-center gap-2", className)}>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={merge(
              "inline-flex h-9 min-w-[52px] items-center justify-center rounded-full px-3 text-[14px] font-medium leading-5 transition",
              isActive(item.href)
                ? "text-[#475569]"
                : "text-[rgba(71,85,105,0.5)] hover:text-[#475569]"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav
      className={merge(
        mobile ? "flex flex-wrap items-center gap-2" : "hidden items-center gap-2 lg:flex",
        className
      )}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
            isActive(item.href)
              ? "bg-secondary text-slate-900"
              : "text-slate-600 hover:bg-secondary/60 hover:text-slate-900"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}

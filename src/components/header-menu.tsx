"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Locale } from "@/lib/locale"

type Props = {
  locale: Locale
  mobile?: boolean
}

export default function HeaderMenu({ locale, mobile = false }: Props) {
  const pathname = usePathname()
  const items =
    locale === "zh"
      ? [
          { href: "/", label: "首页" },
          { href: "/explore", label: "发现" },
          { href: "/forum", label: "论坛" },
        ]
      : [
          { href: "/", label: "Home" },
          { href: "/explore", label: "Discover" },
          { href: "/forum", label: "Forum" },
        ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className={mobile ? "flex flex-wrap items-center gap-2" : "hidden items-center gap-2 lg:flex"}>
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

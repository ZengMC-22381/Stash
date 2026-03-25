import Link from "next/link"
import { Search, UserRound } from "lucide-react"
import HeaderMenu from "@/components/header-menu"
import LanguageSwitcher from "@/components/language-switcher"
import type { Locale } from "@/lib/locale"
import { getCurrentUser } from "@/lib/server-auth"

type Props = {
  locale: Locale
}

export default async function SiteHeader({ locale }: Props) {
  const user = await getCurrentUser()
  const initials = user?.name?.trim()?.charAt(0)?.toUpperCase() || "G"

  const copy =
    locale === "zh"
      ? {
          searchPlaceholder: "搜索 DESIGN.md、标签、作者",
          search: "搜索",
          brand: "ClawHub",
          memberTier: "普通会员",
          guestTier: "访客",
          guestName: "Guest",
          profileLabel: "个人主页",
        }
      : {
          searchPlaceholder: "Search DESIGN.md, tags, authors",
          search: "Search",
          brand: "ClawHub",
          memberTier: "Member",
          guestTier: "Guest",
          guestName: "Guest",
          profileLabel: "Profile",
        }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(228,228,231,0.8)] bg-[rgba(255,255,255,0.8)] backdrop-blur-[8px]">
      <div className="mx-auto h-[65px] w-full max-w-[1279px] px-[63.5px]">
        <div className="hidden h-16 items-center gap-4 px-6 lg:flex">
          <Link href="/" className="relative h-9 w-[126px] shrink-0" aria-label={copy.brand}>
            <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#7847ff] text-[14px] font-semibold leading-5 text-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.02)]">
              C
            </span>
            <span className="absolute left-[44px] top-[4px] font-display text-[28px] leading-7 text-[#0f172a]">
              {copy.brand}
            </span>
          </Link>

          <form action="/explore" method="get" className="relative h-11 w-[448px] shrink-0">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              name="search"
              placeholder={copy.searchPlaceholder}
              className="h-full w-full rounded-full border border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] pl-11 pr-4 text-[14px] text-[#64748b] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.02)] outline-none"
            />
            <button type="submit" className="sr-only">
              {copy.search}
            </button>
          </form>

          <div className="ml-auto flex h-11 items-center gap-2">
            <HeaderMenu locale={locale} variant="header" />
            <LanguageSwitcher locale={locale} variant="header" />
          </div>

          <Link href={user ? `/author/${user.id}` : "/submit"} aria-label={copy.profileLabel} className="pl-2">
            <span className="flex h-10 w-[150px] items-center justify-end gap-2 border-l border-[rgba(175,178,179,0.2)] pl-[9px]">
              <span className="text-right">
                <span className="block text-[10px] leading-[15px] tracking-[0.1em] text-[#5c6060]">
                  {user ? copy.memberTier : copy.guestTier}
                </span>
                <span className="block text-[12px] font-semibold leading-4 text-[#2f3334]">
                  {user?.name || copy.guestName}
                </span>
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#e6deff] bg-white p-[2px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97] text-xs font-semibold text-white">
                  {user ? initials : <UserRound className="h-4 w-4" />}
                </span>
              </span>
            </span>
          </Link>
        </div>

        <div className="flex h-16 items-center justify-between gap-3 px-4 lg:hidden">
          <Link href="/" className="rounded-full bg-[#7847ff] px-4 py-1.5 text-sm font-semibold text-white">
            {copy.brand}
          </Link>
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  )
}

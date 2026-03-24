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
          signedInAs: "未登录",
          guest: "访客",
          profileLabel: "个人主页",
        }
      : {
          searchPlaceholder: "Search DESIGN.md, tags, authors",
          search: "Search",
          signedInAs: "Not signed in",
          guest: "Guest",
          profileLabel: "Profile",
        }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-3 px-6">
        <Link href="/" className="flex items-center gap-2 pr-1 font-display text-xl text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-semibold text-white shadow-soft">
            C
          </span>
          ClawHub
        </Link>

        <form action="/explore" method="get" className="hidden flex-1 items-center md:flex">
          <div className="relative w-full max-w-[340px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              placeholder={copy.searchPlaceholder}
              className="h-10 w-full rounded-full border border-border bg-white pl-11 pr-4 text-sm text-slate-700 shadow-soft outline-none ring-1 ring-transparent transition focus:border-primary focus:ring-primary/30"
            />
          </div>
          <button type="submit" className="sr-only">
            {copy.search}
          </button>
        </form>

        <HeaderMenu locale={locale} />

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} />
          </div>

          <Link
            href={user ? `/author/${user.id}` : "/submit"}
            aria-label={copy.profileLabel}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-2.5 py-1.5 shadow-soft transition hover:border-primary/40"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97] text-xs font-semibold text-white">
              {user ? initials : <UserRound className="h-4 w-4" />}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-xs font-semibold text-slate-800">{user?.name || copy.guest}</span>
              <span className="block text-[11px] text-slate-500">
                {user ? `@${user.handle}` : copy.signedInAs}
              </span>
            </span>
          </Link>
        </div>
      </div>

      <div className="px-6 pb-4 md:hidden">
        <form action="/explore" method="get" className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="search"
            placeholder={copy.searchPlaceholder}
            className="h-11 w-full rounded-full border border-border bg-white/90 pl-11 pr-4 text-sm text-slate-700 shadow-soft outline-none ring-1 ring-transparent"
          />
          <button type="submit" className="sr-only">
            {copy.search}
          </button>
        </form>
        <div className="mt-3">
          <HeaderMenu locale={locale} mobile />
        </div>
        <div className="mt-3">
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  )
}

import Link from "next/link"
import { UserRound } from "lucide-react"
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
          brand: "Stash",
          guestName: "访客",
          profileLabel: "个人主页",
        }
      : {
          brand: "Stash",
          guestName: "Guest",
          profileLabel: "Profile",
        }

  return (
    <header
      data-site-header
      className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(228,228,231,0.8)] bg-[rgba(255,255,255,0.8)] backdrop-blur-[8px]"
    >
      <div className="mx-auto h-[65px] w-full max-w-[1279px] px-[63.5px]">
        <div className="hidden h-16 items-center justify-between px-6 lg:flex">
          <Link href="/" className="font-display text-[20px] font-bold leading-7 text-[#0f172a]" aria-label={copy.brand}>
            {copy.brand}
          </Link>

          <div className="flex h-11 items-center gap-2">
            <HeaderMenu locale={locale} variant="header" className="pr-1" />
            <LanguageSwitcher locale={locale} variant="header" />
            <Link
              href={user ? `/author/${user.id}` : "/login"}
              aria-label={copy.profileLabel}
              className="ml-1 border-l border-[rgba(175,178,179,0.2)] pl-2"
              title={user?.name || copy.guestName}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f3f4f4] bg-white p-[2px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97] text-xs font-semibold text-white">
                  {user ? initials : <UserRound className="h-4 w-4" />}
                </span>
              </span>
            </Link>
          </div>
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

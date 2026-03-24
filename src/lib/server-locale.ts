import { cookies } from "next/headers"
import { LOCALE_COOKIE_NAME, type Locale, normalizeLocale } from "@/lib/locale"

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value)
}

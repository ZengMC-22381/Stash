import { NextRequest, NextResponse } from "next/server"
import { LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/locale"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const locale = normalizeLocale(typeof body.locale === "string" ? body.locale : null)

    const response = NextResponse.json({ locale })
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Failed to set locale." }, { status: 500 })
  }
}

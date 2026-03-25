import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { RATE_LIMIT_RULES } from "@/lib/rate-limit-rules"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(request, RATE_LIMIT_RULES.authLogin)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const body = await request.json()
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials." }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
    }

    const token = await createToken(user.id)
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        handle: user.handle,
        createdAt: user.createdAt,
      },
    })
    setAuthCookie(response, token)
    return response
  } catch (error) {
    console.error("[LOGIN]", error)
    return NextResponse.json({ error: "Login failed." }, { status: 500 })
  }
}

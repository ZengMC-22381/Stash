import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createToken, hashPassword, setAuthCookie } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { RATE_LIMIT_RULES } from "@/lib/rate-limit-rules"
import { ensureUniqueSlug } from "@/lib/slug"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit(request, RATE_LIMIT_RULES.authRegister)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const body = await request.json()
    const rawName = String(body.name || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")
    const handleInput = String(body.handle || "").trim()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password." }, { status: 400 })
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "Password must be between 8 and 128 characters." }, { status: 400 })
    }

    const fallbackName = email.split("@")[0]?.trim().replace(/[._-]+/g, " ") || ""
    const normalizedFallbackName = fallbackName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
    const name = rawName || normalizedFallbackName || "Creator"

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use." }, { status: 409 })
    }

    const baseHandle = handleInput || email.split("@")[0] || "user"
    const handle = await ensureUniqueSlug(baseHandle, async (slug) => {
      const user = await prisma.user.findUnique({ where: { handle: slug } })
      return Boolean(user)
    })

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        handle,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        handle: true,
        createdAt: true,
      },
    })

    const token = await createToken(user.id)
    const response = NextResponse.json({ user })
    setAuthCookie(response, token)
    return response
  } catch (error) {
    console.error("[REGISTER]", error)
    return NextResponse.json({ error: "Registration failed." }, { status: 500 })
  }
}

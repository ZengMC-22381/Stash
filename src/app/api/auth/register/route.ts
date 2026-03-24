import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createToken, hashPassword, setAuthCookie } from "@/lib/auth"
import { ensureUniqueSlug } from "@/lib/slug"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = String(body.name || "").trim()
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")
    const handleInput = String(body.handle || "").trim()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use." }, { status: 409 })
    }

    const baseHandle = handleInput || name || email.split("@")[0]
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

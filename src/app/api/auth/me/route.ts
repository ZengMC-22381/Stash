import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { clearAuthCookie, getUserIdFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, handle: true, createdAt: true },
  })

  if (!user) {
    const response = NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    clearAuthCookie(response)
    return response
  }

  return NextResponse.json({ user })
}

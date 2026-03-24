import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME, getUserIdFromToken } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value
  const userId = await getUserIdFromToken(token)

  if (!userId) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, handle: true },
  })
}

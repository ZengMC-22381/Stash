import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import type { NextRequest, NextResponse } from "next/server"

export const AUTH_COOKIE_NAME = "stash_token"
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me")

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function getUserIdFromToken(token?: string | null) {
  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    return typeof payload.sub === "string" ? payload.sub : null
  } catch {
    return null
  }
}

export async function getUserIdFromRequest(request: NextRequest) {
  return getUserIdFromToken(request.cookies.get(AUTH_COOKIE_NAME)?.value)
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  })
}

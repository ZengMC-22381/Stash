import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { getUserIdFromRequest } from "@/lib/auth"
import { enforceRateLimit } from "@/lib/rate-limit"
import { RATE_LIMIT_RULES } from "@/lib/rate-limit-rules"
import { resolveUploadExtension, validateUploadBatch } from "@/lib/upload-policy"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const rateLimit = enforceRateLimit(request, RATE_LIMIT_RULES.uploadImages, userId)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Too many upload attempts. Please try again later." }, {
        status: 429,
        headers: rateLimit.headers,
      })
    }

    const formData = await request.formData()
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File)

    const validation = validateUploadBatch(
      files.map((file) => ({
        size: file.size,
        type: file.type,
        name: file.name,
      }))
    )
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: validation.status })
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const uploaded: { url: string; name: string; size: number }[] = []

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = resolveUploadExtension({ type: file.type, name: file.name, size: file.size })
      const filename = `${crypto.randomUUID()}${ext}`
      const filePath = path.join(uploadsDir, filename)

      await writeFile(filePath, buffer)
      uploaded.push({ url: `/uploads/${filename}`, name: file.name, size: file.size })
    }

    if (!uploaded.length) {
      return NextResponse.json({ error: "No valid images uploaded." }, { status: 400 })
    }

    return NextResponse.json({ files: uploaded, urls: uploaded.map((file) => file.url) })
  } catch (error) {
    console.error("[UPLOAD_POST]", error)
    return NextResponse.json({ error: "Upload failed." }, { status: 500 })
  }
}

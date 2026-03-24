import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { getUserIdFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files")

    if (!files.length) {
      return NextResponse.json({ error: "No files uploaded." }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const uploaded: { url: string; name: string; size: number }[] = []

    for (const entry of files) {
      if (!(entry instanceof File)) continue
      if (entry.type && !entry.type.startsWith("image/")) continue

      const arrayBuffer = await entry.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = path.extname(entry.name) || ".png"
      const filename = `${crypto.randomUUID()}${ext}`
      const filePath = path.join(uploadsDir, filename)

      await writeFile(filePath, buffer)
      uploaded.push({ url: `/uploads/${filename}`, name: entry.name, size: entry.size })
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

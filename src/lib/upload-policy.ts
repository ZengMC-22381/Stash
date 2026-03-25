export const UPLOAD_POLICY = {
  maxFilesPerRequest: 8,
  maxFileSizeBytes: 4 * 1024 * 1024,
  maxTotalSizeBytes: 16 * 1024 * 1024,
} as const

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
])

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
}

const FALLBACK_EXTENSION = ".png"

export type UploadCandidate = {
  size: number
  type?: string | null
  name?: string | null
}

export function isAllowedImageMimeType(type: string) {
  return ALLOWED_MIME_TYPES.has(type.toLowerCase())
}

export function resolveUploadExtension(file: UploadCandidate): string {
  const normalizedType = (file.type || "").trim().toLowerCase()
  if (normalizedType && MIME_EXTENSION_MAP[normalizedType]) {
    return MIME_EXTENSION_MAP[normalizedType]
  }

  const rawName = (file.name || "").trim().toLowerCase()
  const nameMatch = rawName.match(/\.(jpe?g|png|webp|gif|avif)$/)
  if (nameMatch) {
    return nameMatch[0] === ".jpeg" ? ".jpg" : nameMatch[0]
  }

  return FALLBACK_EXTENSION
}

export function validateUploadBatch(
  files: UploadCandidate[]
): { ok: true } | { ok: false; status: number; error: string } {
  if (!files.length) {
    return { ok: false, status: 400, error: "No files uploaded." }
  }

  if (files.length > UPLOAD_POLICY.maxFilesPerRequest) {
    return {
      ok: false,
      status: 400,
      error: `Too many files. Maximum allowed is ${UPLOAD_POLICY.maxFilesPerRequest}.`,
    }
  }

  let totalSize = 0
  for (const file of files) {
    const type = (file.type || "").trim().toLowerCase()
    const size = Number(file.size) || 0
    totalSize += size

    if (!type || !isAllowedImageMimeType(type)) {
      return {
        ok: false,
        status: 400,
        error: "Only image uploads are supported (jpeg, png, webp, gif, avif).",
      }
    }

    if (size <= 0) {
      return { ok: false, status: 400, error: "Uploaded file is empty." }
    }

    if (size > UPLOAD_POLICY.maxFileSizeBytes) {
      return {
        ok: false,
        status: 413,
        error: `Each image must be <= ${Math.floor(UPLOAD_POLICY.maxFileSizeBytes / 1024 / 1024)}MB.`,
      }
    }
  }

  if (totalSize > UPLOAD_POLICY.maxTotalSizeBytes) {
    return {
      ok: false,
      status: 413,
      error: `Total upload size must be <= ${Math.floor(UPLOAD_POLICY.maxTotalSizeBytes / 1024 / 1024)}MB.`,
    }
  }

  return { ok: true }
}

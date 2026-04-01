export const UPLOAD_POLICY = {
  maxFilesPerRequest: 8,
  maxFileSizeBytes: 4 * 1024 * 1024,
  maxTotalSizeBytes: 16 * 1024 * 1024,
} as const

export const FILE_UPLOAD_POLICY = {
  maxFilesPerRequest: 1,
  maxFileSizeBytes: 50 * 1024 * 1024,
  maxTotalSizeBytes: 50 * 1024 * 1024,
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
const FALLBACK_GENERIC_EXTENSION = ".bin"

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

const MIME_GENERIC_EXTENSION_MAP: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/json": ".json",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "text/plain": ".txt",
  "text/markdown": ".md",
  "text/csv": ".csv",
}

function sanitizeExtension(name: string) {
  const match = name.toLowerCase().match(/(\.[a-z0-9]{1,10})$/)
  return match ? match[1] : ""
}

export function resolveGenericUploadExtension(file: UploadCandidate): string {
  const fromName = sanitizeExtension((file.name || "").trim())
  if (fromName) return fromName

  const normalizedType = (file.type || "").trim().toLowerCase()
  if (normalizedType && MIME_GENERIC_EXTENSION_MAP[normalizedType]) {
    return MIME_GENERIC_EXTENSION_MAP[normalizedType]
  }

  return FALLBACK_GENERIC_EXTENSION
}

export function validateGenericFileUploadBatch(
  files: UploadCandidate[]
): { ok: true } | { ok: false; status: number; error: string } {
  if (!files.length) {
    return { ok: false, status: 400, error: "No files uploaded." }
  }

  if (files.length > FILE_UPLOAD_POLICY.maxFilesPerRequest) {
    return {
      ok: false,
      status: 400,
      error: `Only ${FILE_UPLOAD_POLICY.maxFilesPerRequest} file can be uploaded at a time.`,
    }
  }

  let totalSize = 0
  for (const file of files) {
    const size = Number(file.size) || 0
    totalSize += size

    if (size <= 0) {
      return { ok: false, status: 400, error: "Uploaded file is empty." }
    }

    if (size > FILE_UPLOAD_POLICY.maxFileSizeBytes) {
      return {
        ok: false,
        status: 413,
        error: `Each file must be <= ${Math.floor(FILE_UPLOAD_POLICY.maxFileSizeBytes / 1024 / 1024)}MB.`,
      }
    }
  }

  if (totalSize > FILE_UPLOAD_POLICY.maxTotalSizeBytes) {
    return {
      ok: false,
      status: 413,
      error: `Total upload size must be <= ${Math.floor(FILE_UPLOAD_POLICY.maxTotalSizeBytes / 1024 / 1024)}MB.`,
    }
  }

  return { ok: true }
}

/* eslint-disable @next/next/no-img-element */
"use client"

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react"
import { ArrowDown, Check, FileText, Link2, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Locale } from "@/lib/locale"
import { cn } from "@/lib/utils"

interface DictionaryOption {
  value: string
  label: string
}

interface ResourceDictionary {
  resourceTypes: DictionaryOption[]
  tools: DictionaryOption[]
  tags: DictionaryOption[]
  scenarios: DictionaryOption[]
}

type Props = {
  locale: Locale
}

type BlockType = "markdown" | "link" | "file"

type UploadedFile = {
  url: string
  name: string
  size: number
  type?: string
}

type ContentBlockState = {
  id: string
  type: BlockType
  markdown: string
  url: string
  title: string
  previewImageUrl: string
  file: UploadedFile | null
  error: string | null
  uploading: boolean
}

type EffectImageState = {
  id: string
  url: string
}

type PublishButtonState = "idle" | "submitting" | "success"

const emptyDictionary: ResourceDictionary = {
  resourceTypes: [],
  tools: [],
  tags: [],
  scenarios: [],
}

const MAX_CONTENT_BLOCKS = 10
const MAX_EFFECT_IMAGES = 15
const MAX_UPLOAD_FILE_SIZE_BYTES = 50 * 1024 * 1024

const publishConfettiPieces = [
  { id: "a", left: "12%", top: "40%", x: "-38px", y: "-36px", rotate: "-28deg", delay: 10, size: 8, color: "#7aa5ff" },
  { id: "b", left: "20%", top: "28%", x: "-24px", y: "-56px", rotate: "-42deg", delay: 35, size: 7, color: "#4f74ff" },
  { id: "c", left: "27%", top: "38%", x: "-14px", y: "-48px", rotate: "-20deg", delay: 120, size: 6, color: "#8db4ff" },
  { id: "d", left: "34%", top: "30%", x: "-8px", y: "-68px", rotate: "14deg", delay: 65, size: 8, color: "#5f66ff" },
  { id: "e", left: "48%", top: "22%", x: "0px", y: "-72px", rotate: "6deg", delay: 0, size: 7, color: "#88b3ff" },
  { id: "f", left: "62%", top: "28%", x: "12px", y: "-64px", rotate: "24deg", delay: 80, size: 8, color: "#4f74ff" },
  { id: "g", left: "72%", top: "36%", x: "22px", y: "-50px", rotate: "36deg", delay: 55, size: 6, color: "#8aa9ff" },
  { id: "h", left: "81%", top: "42%", x: "36px", y: "-34px", rotate: "52deg", delay: 25, size: 8, color: "#5f66ff" },
  { id: "i", left: "86%", top: "30%", x: "44px", y: "-56px", rotate: "40deg", delay: 95, size: 6, color: "#8fb4ff" },
] as const

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function createBlock(type: BlockType): ContentBlockState {
  return {
    id: createId(),
    type,
    markdown: "",
    url: "",
    title: "",
    previewImageUrl: "",
    file: null,
    error: null,
    uploading: false,
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

function deriveLinkTitle(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./i, "") || url
  } catch {
    return url
  }
}

function stripMarkdown(input: string) {
  return input
    .replace(/\r/g, "")
    .replace(/^\s*#{1,6}\s*/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function buildLegacyContent(
  blocks: Array<
    | { type: "markdown"; markdown: string }
    | { type: "link"; url: string; title: string; previewImageUrl?: string }
    | { type: "file"; fileUrl: string; fileName: string; fileSizeBytes: number; mimeType?: string }
  >
) {
  return blocks
    .map((block) => {
      if (block.type === "markdown") {
        return block.markdown
      }
      if (block.type === "link") {
        return [`## Link`, block.title, block.url].join("\n")
      }
      return [`## File`, block.fileName, block.fileUrl].join("\n")
    })
    .join("\n\n")
}

export default function SubmitForm({ locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          pageTitle: "发布资源",
          resourceType: "资源类型",
          resourceName: "资源名称",
          selectResourceType: "Select one",
          resourceNamePlaceholder: "Name",
          contentSection: "资源内容",
          blockCounter: "内容块",
          markdownBlock: "Markdown内容",
          markdownPlaceholder: "详细内容...",
          linkBlock: "链接块",
          linkUrl: "链接地址",
          linkTitle: "链接名称",
          linkPreview: "预览图 URL（可选）",
          fileBlock: "文件块",
          chooseFile: "上传文件",
          fileLimit: "单个文件上限 50MB",
          addBlock: "新增内容块",
          addMarkdown: "Markdown",
          addLink: "链接",
          addFile: "文件",
          blockLimitReached: `最多支持 ${MAX_CONTENT_BLOCKS} 个内容块。`,
          effectImages: "效果图上传",
          effectImageCounter: "已上传",
          imageLimitHint: `最多上传 ${MAX_EFFECT_IMAGES} 张效果图`,
          uploadImage: "点击上传效果图",
          uploadImageHint: "支持 JPG / PNG / WEBP / GIF / AVIF",
          dropToUpload: "拖拽到此处即可上传",
          uploadingImage: "上传中...",
          publish: "发布",
          publishSuccess: "发布成功",
          publishing: "发布中...",
          submitNeedLogin: "请先登录后再投稿。",
          submitFailed: "投稿失败，请稍后重试。",
          uploadFailed: "上传失败，请稍后重试。",
          uploadNeedLogin: "请先登录后再上传。",
          titleRequired: "请填写资源名称。",
          blockRequired: "请至少填写一个内容块。",
          blockIncomplete: "请完善所有内容块后再发布。",
          remove: "移除",
        }
      : {
          pageTitle: "Publish Resource",
          resourceType: "Resource Type",
          resourceName: "Resource Name",
          selectResourceType: "Select one",
          resourceNamePlaceholder: "Name",
          contentSection: "Content Blocks",
          blockCounter: "Blocks",
          markdownBlock: "Markdown",
          markdownPlaceholder: "Detailed content...",
          linkBlock: "Link",
          linkUrl: "Link URL",
          linkTitle: "Link Title",
          linkPreview: "Preview image URL (optional)",
          fileBlock: "File",
          chooseFile: "Upload file",
          fileLimit: "Single file limit: 50MB",
          addBlock: "Add block",
          addMarkdown: "Markdown",
          addLink: "Link",
          addFile: "File",
          blockLimitReached: `Up to ${MAX_CONTENT_BLOCKS} content blocks are supported.`,
          effectImages: "Preview Uploads",
          effectImageCounter: "Uploaded",
          imageLimitHint: `Up to ${MAX_EFFECT_IMAGES} preview images`,
          uploadImage: "Click to upload preview image",
          uploadImageHint: "Supports JPG / PNG / WEBP / GIF / AVIF",
          dropToUpload: "Drop to upload",
          uploadingImage: "Uploading...",
          publish: "Publish",
          publishSuccess: "Success",
          publishing: "Publishing...",
          submitNeedLogin: "Please sign in before submitting.",
          submitFailed: "Submission failed. Please try again.",
          uploadFailed: "Upload failed. Please try again.",
          uploadNeedLogin: "Please sign in before uploading.",
          titleRequired: "Please enter a resource name.",
          blockRequired: "Please provide at least one content block.",
          blockIncomplete: "Please complete all content blocks before publishing.",
          remove: "Remove",
        }

  const [dictionary, setDictionary] = useState<ResourceDictionary>(emptyDictionary)
  const [resourceType, setResourceType] = useState("design-md")
  const [title, setTitle] = useState("")
  const [blocks, setBlocks] = useState<ContentBlockState[]>([createBlock("markdown")])
  const [effectImages, setEffectImages] = useState<EffectImageState[]>([])
  const [uploadingEffectImage, setUploadingEffectImage] = useState(false)
  const [isEffectDropActive, setIsEffectDropActive] = useState(false)
  const [uploadingRecordsCount, setUploadingRecordsCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [publishState, setPublishState] = useState<PublishButtonState>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const effectImageInputRef = useRef<HTMLInputElement | null>(null)
  const successRedirectTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const response = await fetch("/api/resources/dictionary")
        if (!response.ok) return

        const data = await response.json()
        const nextDictionary = data.dictionary || emptyDictionary
        setDictionary(nextDictionary)

        if (Array.isArray(nextDictionary.resourceTypes) && nextDictionary.resourceTypes.length > 0) {
          setResourceType((current) => current || nextDictionary.resourceTypes[0].value)
        }
      } catch {
        // ignore
      }
    }

    loadDictionary()
  }, [])

  useEffect(() => {
    if (!uploadingEffectImage) {
      setUploadingRecordsCount(0)
      return
    }

    setUploadingRecordsCount(128)
    const timer = window.setInterval(() => {
      setUploadingRecordsCount((current) => current + Math.floor(Math.random() * 260) + 40)
    }, 220)

    return () => window.clearInterval(timer)
  }, [uploadingEffectImage])

  useEffect(() => {
    return () => {
      if (successRedirectTimerRef.current !== null) {
        window.clearTimeout(successRedirectTimerRef.current)
      }
    }
  }, [])

  const imageCountText = useMemo(() => `${effectImages.length}/${MAX_EFFECT_IMAGES}`, [effectImages.length])
  const blockCountText = useMemo(() => `${blocks.length}/${MAX_CONTENT_BLOCKS}`, [blocks.length])

  const updateBlock = (id: string, updater: (block: ContentBlockState) => ContentBlockState) => {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== id) return block
        return updater(block)
      })
    )
  }

  const addBlock = (type: BlockType) => {
    if (blocks.length >= MAX_CONTENT_BLOCKS) {
      setMessage(copy.blockLimitReached)
      return
    }
    setMessage(null)
    setBlocks((current) => [...current, createBlock(type)])
  }

  const removeBlock = (id: string) => {
    setBlocks((current) => {
      if (current.length <= 1) return current
      return current.filter((block) => block.id !== id)
    })
  }

  const removeEffectImage = (id: string) => {
    setEffectImages((current) => current.filter((image) => image.id !== id))
  }

  const uploadEffectImageFile = async (file: File) => {
    if (effectImages.length >= MAX_EFFECT_IMAGES) {
      setMessage(copy.imageLimitHint)
      return
    }

    setMessage(null)
    setUploadingEffectImage(true)
    const uploadAnimationStart = performance.now()
    const minUploadAnimationMs = 1000
    try {
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401) {
          setMessage(copy.uploadNeedLogin)
        } else {
          setMessage(data.error || copy.uploadFailed)
        }
        return
      }

      const firstUrl = data?.files?.[0]?.url || data?.urls?.[0]
      if (!firstUrl) {
        setMessage(copy.uploadFailed)
        return
      }

      setEffectImages((current) => [...current, { id: createId(), url: firstUrl }].slice(0, MAX_EFFECT_IMAGES))
    } catch {
      setMessage(copy.uploadFailed)
    } finally {
      const elapsed = performance.now() - uploadAnimationStart
      if (elapsed < minUploadAnimationMs) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, minUploadAnimationMs - elapsed)
        })
      }
      setUploadingEffectImage(false)
    }
  }

  const handleEffectImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    await uploadEffectImageFile(file)
  }

  const handleEffectImageDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsEffectDropActive(false)
    if (uploadingEffectImage) return
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    await uploadEffectImageFile(file)
  }

  const openEffectImagePicker = () => {
    if (uploadingEffectImage) return
    effectImageInputRef.current?.click()
  }

  const handleFileBlockUpload = async (blockId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
      updateBlock(blockId, (block) => ({
        ...block,
        error: copy.fileLimit,
      }))
      return
    }

    updateBlock(blockId, (block) => ({ ...block, uploading: true, error: null }))
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch("/api/uploads/files", {
        method: "POST",
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        updateBlock(blockId, (block) => ({
          ...block,
          uploading: false,
          error: data.error || copy.uploadFailed,
        }))
        if (response.status === 401) {
          setMessage(copy.uploadNeedLogin)
        }
        return
      }

      const uploaded = data?.files?.[0]
      if (!uploaded?.url) {
        updateBlock(blockId, (block) => ({
          ...block,
          uploading: false,
          error: copy.uploadFailed,
        }))
        return
      }

      updateBlock(blockId, (block) => ({
        ...block,
        uploading: false,
        error: null,
        file: {
          url: uploaded.url,
          name: uploaded.name || file.name,
          size: Number(uploaded.size) || file.size,
          type: uploaded.type || file.type,
        },
      }))
    } catch {
      updateBlock(blockId, (block) => ({
        ...block,
        uploading: false,
        error: copy.uploadFailed,
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setPublishState("submitting")
    setMessage(null)

    const failSubmit = (nextMessage: string) => {
      setMessage(nextMessage)
      setPublishState("idle")
    }

    try {
      const normalizedTitle = title.trim()
      if (!normalizedTitle) {
        failSubmit(copy.titleRequired)
        return
      }

      const normalizedBlocks: Array<
        | { type: "markdown"; markdown: string }
        | { type: "link"; url: string; title: string; previewImageUrl?: string }
        | { type: "file"; fileUrl: string; fileName: string; fileSizeBytes: number; mimeType?: string }
      > = []

      for (const block of blocks) {
        if (block.type === "markdown") {
          const markdown = block.markdown.trim()
          if (!markdown) {
            failSubmit(copy.blockIncomplete)
            return
          }
          normalizedBlocks.push({ type: "markdown", markdown })
          continue
        }

        if (block.type === "link") {
          const url = block.url.trim()
          if (!url) {
            failSubmit(copy.blockIncomplete)
            return
          }

          const normalizedLinkTitle = block.title.trim() || deriveLinkTitle(url)
          const previewImageUrl = block.previewImageUrl.trim()
          normalizedBlocks.push({
            type: "link",
            url,
            title: normalizedLinkTitle,
            previewImageUrl: previewImageUrl || undefined,
          })
          continue
        }

        if (!block.file) {
          failSubmit(copy.blockIncomplete)
          return
        }

        normalizedBlocks.push({
          type: "file",
          fileUrl: block.file.url,
          fileName: block.file.name,
          fileSizeBytes: block.file.size,
          mimeType: block.file.type,
        })
      }

      if (!normalizedBlocks.length) {
        failSubmit(copy.blockRequired)
        return
      }

      const content = buildLegacyContent(normalizedBlocks)
      const descriptionCandidate =
        stripMarkdown(content).slice(0, 160) || `Resource: ${normalizedTitle}`

      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: normalizedTitle,
          description: descriptionCandidate,
          contentBlocks: normalizedBlocks,
          resourceType,
          tags: [],
          images: effectImages.map((image, order) => ({ url: image.url, order })),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (response.status === 401) {
          failSubmit(copy.submitNeedLogin)
        } else {
          failSubmit(data.error || copy.submitFailed)
        }
        return
      }

      const createdSlug = data.resource?.slug || data.design?.slug
      if (!createdSlug) {
        failSubmit(copy.submitFailed)
        return
      }

      setMessage(null)
      setPublishState("success")
      setTitle("")
      setBlocks([createBlock("markdown")])
      setEffectImages([])

      if (successRedirectTimerRef.current !== null) {
        window.clearTimeout(successRedirectTimerRef.current)
      }

      successRedirectTimerRef.current = window.setTimeout(() => {
        window.location.assign("/explore")
      }, 950)
    } catch {
      failSubmit(copy.submitFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="h-full w-full">
      <div className="flex h-full min-h-0 bg-[#f9f9f9]">
        <section className="flex min-h-0 flex-1 flex-col border-r border-[rgba(0,0,0,0.05)] bg-[#f9f9f9] px-12 pb-6 pt-10">
          <h1 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#2f3334]">{copy.pageTitle}</h1>

          <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
            <div className="space-y-6 pb-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label variant="unstyled" className="text-sm font-medium text-black">
                    {copy.resourceType}
                  </Label>
                  <select
                    value={resourceType}
                    onChange={(event) => setResourceType(event.target.value)}
                    className="h-10 w-full rounded-[8px] border border-[#e5e5e5] bg-white px-3 text-sm text-[#333333] shadow-[0px_1px_2px_rgba(0,0,0,0.1)] outline-none focus:border-[#999999]"
                  >
                    <option value="">{copy.selectResourceType}</option>
                    {dictionary.resourceTypes.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label variant="unstyled" className="text-sm font-medium text-black">
                    {copy.resourceName}
                  </Label>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={copy.resourceNamePlaceholder}
                    className="h-10 rounded-[8px] border border-[#e5e5e5] bg-white px-3 text-base text-[#333333] shadow-[0px_1px_2px_rgba(0,0,0,0.1)] focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#333333]">{copy.contentSection}</p>
                  <span className="text-xs text-[#7a7a7a]">
                    {copy.blockCounter} {blockCountText}
                  </span>
                </div>

                <div className="space-y-3">
                  {blocks.map((block) => {
                    if (block.type === "markdown") {
                      return (
                        <div key={block.id} className="rounded-[10px] border border-[#2b2d30] bg-[#1f2023] p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 text-sm text-[#bbbbbb]">
                              <FileText className="h-4 w-4" />
                              {copy.markdownBlock}
                            </div>
                            {blocks.length > 1 ? (
                              <Button
                                variant="unstyled"
                                type="button"
                                onClick={() => removeBlock(block.id)}
                                className="inline-flex items-center text-[#9ca3af] hover:text-white"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>

                          <Textarea
                            value={block.markdown}
                            onChange={(event) =>
                              updateBlock(block.id, (current) => ({ ...current, markdown: event.target.value }))
                            }
                            placeholder={copy.markdownPlaceholder}
                            className="min-h-[260px] resize-y border-0 bg-transparent px-0 py-0 text-base text-[#fcfcfc] focus-visible:ring-0"
                          />
                        </div>
                      )
                    }

                    if (block.type === "link") {
                      const previewUrl = block.previewImageUrl.trim()
                      const previewTitle = block.title.trim() || deriveLinkTitle(block.url.trim())
                      return (
                        <div key={block.id} className="space-y-3 rounded-[10px] border border-[#d9d9d9] bg-white p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.08)]">
                          <div className="flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 text-sm text-[#333333]">
                              <Link2 className="h-4 w-4" />
                              {copy.linkBlock}
                            </div>
                            <Button
                              variant="unstyled"
                              type="button"
                              onClick={() => removeBlock(block.id)}
                              className="inline-flex items-center text-[#8a8a8a] hover:text-[#111111]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <Input
                            value={block.url}
                            onChange={(event) =>
                              updateBlock(block.id, (current) => ({ ...current, url: event.target.value, error: null }))
                            }
                            placeholder={copy.linkUrl}
                            className="h-10 rounded-[8px] border border-[#e5e5e5]"
                          />
                          <Input
                            value={block.title}
                            onChange={(event) =>
                              updateBlock(block.id, (current) => ({ ...current, title: event.target.value }))
                            }
                            placeholder={copy.linkTitle}
                            className="h-10 rounded-[8px] border border-[#e5e5e5]"
                          />
                          <Input
                            value={block.previewImageUrl}
                            onChange={(event) =>
                              updateBlock(block.id, (current) => ({ ...current, previewImageUrl: event.target.value }))
                            }
                            placeholder={copy.linkPreview}
                            className="h-10 rounded-[8px] border border-[#e5e5e5]"
                          />

                          {block.url.trim() ? (
                            <a
                              href={block.url.trim()}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 rounded-[10px] border border-[#ebebeb] bg-[#fafafa] p-3"
                            >
                              <div className="h-16 w-16 overflow-hidden rounded-[8px] bg-[#e9e9e9]">
                                {previewUrl ? (
                                  <img src={previewUrl} alt={previewTitle || block.url.trim()} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[11px] text-[#777777]">No Image</div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-[#1e1e1e]">{previewTitle}</p>
                                <p className="truncate text-xs text-[#666666]">{block.url.trim()}</p>
                              </div>
                            </a>
                          ) : null}
                        </div>
                      )
                    }

                    return (
                      <div key={block.id} className="space-y-3 rounded-[10px] border border-[#d9d9d9] bg-white p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.08)]">
                        <div className="flex items-center justify-between">
                          <div className="inline-flex items-center gap-2 text-sm text-[#333333]">
                            <FileText className="h-4 w-4" />
                            {copy.fileBlock}
                          </div>
                          <Button
                            variant="unstyled"
                            type="button"
                            onClick={() => removeBlock(block.id)}
                            className="inline-flex items-center text-[#8a8a8a] hover:text-[#111111]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {block.file ? (
                          <div className="rounded-[10px] border border-[#e6e6e6] bg-[#fafafa] p-3">
                            <p className="truncate text-sm font-semibold text-[#222222]">{block.file.name}</p>
                            <p className="mt-1 text-xs text-[#666666]">{formatBytes(block.file.size)}</p>
                            <a href={block.file.url} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs text-[#4f46e5]">
                              {block.file.url}
                            </a>
                          </div>
                        ) : null}

                        <Label variant="unstyled" className="inline-flex cursor-pointer items-center gap-2 rounded-[8px] border border-[#dadada] bg-white px-4 py-2 text-sm font-medium text-[#333333]">
                          {block.uploading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {copy.chooseFile}
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              {copy.chooseFile}
                            </>
                          )}
                          <Input
                            type="file"
                            className="hidden"
                            onChange={(event) => void handleFileBlockUpload(block.id, event)}
                            disabled={block.uploading}
                          />
                        </Label>
                        <p className="text-xs text-[#777777]">{copy.fileLimit}</p>
                        {block.error ? <p className="text-xs text-[#dc2626]">{block.error}</p> : null}
                      </div>
                    )
                  })}
                </div>

                <div className="rounded-[10px] border border-[#e3e3e3] bg-white px-3 py-2">
                  <p className="mb-2 text-xs text-[#777777]">{copy.addBlock}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <Button
                      variant="unstyled"
                      type="button"
                      onClick={() => addBlock("markdown")}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-[8px] border border-[#e5e5e5] bg-[#f9f9f9] text-sm text-[#333333]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {copy.addMarkdown}
                    </Button>
                    <Button
                      variant="unstyled"
                      type="button"
                      onClick={() => addBlock("link")}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-[8px] border border-[#e5e5e5] bg-[#f9f9f9] text-sm text-[#333333]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {copy.addLink}
                    </Button>
                    <Button
                      variant="unstyled"
                      type="button"
                      onClick={() => addBlock("file")}
                      className="inline-flex h-9 items-center justify-center gap-1 rounded-[8px] border border-[#e5e5e5] bg-[#f9f9f9] text-sm text-[#333333]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {copy.addFile}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[rgba(0,0,0,0.05)] px-2 pt-4">
            <div className="min-h-[20px] text-sm text-[#666666]">{message || ""}</div>
            <Button
              variant="unstyled"
              type="submit"
              disabled={loading || publishState !== "idle"}
              className="relative inline-flex h-11 min-w-[176px] items-center justify-center rounded-full border border-[#1f2a4b] px-4 text-sm font-medium text-[#eef2ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_34px_-18px_rgba(7,11,26,0.95)] transition-[transform,filter,box-shadow] duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:brightness-100"
            >
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 bg-[linear-gradient(145deg,#090f25_0%,#101a3a_48%,#0a142d_100%)]" />
                <span className="absolute inset-[1px] rounded-full bg-[radial-gradient(120%_95%_at_50%_0%,rgba(102,130,255,0.26)_0%,rgba(102,130,255,0)_68%)]" />
                {publishState === "idle" ? (
                  <span className="absolute -left-[40%] top-0 h-full w-[38%] bg-[linear-gradient(105deg,rgba(77,111,255,0)_0%,rgba(111,145,255,0.42)_52%,rgba(77,111,255,0)_100%)] animate-submit-button-shimmer" />
                ) : null}
              </span>

              <span
                className={cn(
                  "relative z-10 inline-flex min-w-[108px] items-center justify-center gap-2 text-sm font-medium",
                  publishState === "success" ? "animate-submit-button-success" : ""
                )}
              >
                {publishState === "submitting" ? (
                  <span className="inline-flex items-center gap-1.5">
                    {[0, 1, 2].map((index) => (
                      <span
                        key={index}
                        className="h-1.5 w-1.5 rounded-full bg-[#4f74ff] animate-submit-button-dot"
                        style={{ animationDelay: `${index * 120}ms` }}
                      />
                    ))}
                  </span>
                ) : publishState === "success" ? (
                  <>
                    <Check className="h-4 w-4 text-[#4cf2a3]" />
                    <span>{copy.publishSuccess}</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-4 w-4 text-[#4f74ff]" />
                    <span>{copy.publish}</span>
                  </>
                )}
              </span>

              {publishState === "success" ? (
                <span className="pointer-events-none absolute inset-0">
                  {publishConfettiPieces.map((piece) => {
                    const style = {
                      left: piece.left,
                      top: piece.top,
                      width: `${piece.size}px`,
                      height: `${Math.max(4, Math.round(piece.size * 0.64))}px`,
                      backgroundColor: piece.color,
                      animationDelay: `${piece.delay}ms`,
                      "--submit-confetti-x": piece.x,
                      "--submit-confetti-y": piece.y,
                      "--submit-confetti-rotate": piece.rotate,
                    } as CSSProperties

                    return <span key={piece.id} className="absolute rounded-[2px] animate-submit-button-confetti" style={style} />
                  })}
                </span>
              ) : null}
            </Button>
          </div>
        </section>

        <aside className="flex min-h-0 flex-1 flex-col bg-[#eeede9] px-12 pb-8 pt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#333333]">{copy.effectImages}</h2>
            <span className="text-xs text-[#6a6a6a]">
              {copy.effectImageCounter} {imageCountText}
            </span>
          </div>

          {message ? (
            <p className="mb-4 rounded-[10px] border border-[rgba(0,0,0,0.08)] bg-white/70 px-3 py-2 text-xs text-[#4a4a4a]">
              {message}
            </p>
          ) : null}

          <div className="relative min-h-0 flex-1">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-[#eeede9] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-[#eeede9] to-transparent" />

            <div className="h-full space-y-6 overflow-y-auto px-3 pb-8 pt-3">
              {effectImages.map((image) => (
                <div
                  key={image.id}
                  className="rounded-[30px] border-2 border-white/70 bg-[rgba(255,255,255,0.35)] p-[6px] shadow-[0_28px_48px_rgba(0,0,0,0.12)]"
                >
                  <div className="relative overflow-hidden rounded-[26px] bg-white">
                    <img src={image.url} alt="Uploaded preview" className="h-[340px] w-full object-cover" />
                    <Button
                      variant="unstyled"
                      type="button"
                      onClick={() => removeEffectImage(image.id)}
                      className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#333333]"
                    >
                      {copy.remove}
                    </Button>
                  </div>
                </div>
              ))}

              {effectImages.length < MAX_EFFECT_IMAGES ? (
                <div
                  role="button"
                  tabIndex={uploadingEffectImage ? -1 : 0}
                  className={`group block rounded-[30px] border-2 border-white/70 bg-[rgba(255,255,255,0.35)] p-[6px] shadow-[0_28px_48px_rgba(0,0,0,0.12)] ${
                    uploadingEffectImage ? "cursor-not-allowed opacity-90" : "cursor-pointer"
                  }`}
                  onClick={openEffectImagePicker}
                  onKeyDown={(event) => {
                    if (uploadingEffectImage) return
                    if (event.key !== "Enter" && event.key !== " ") return
                    event.preventDefault()
                    openEffectImagePicker()
                  }}
                  onDragEnter={(event) => {
                    event.preventDefault()
                    if (!uploadingEffectImage) setIsEffectDropActive(true)
                  }}
                  onDragOver={(event) => {
                    event.preventDefault()
                    if (!uploadingEffectImage) setIsEffectDropActive(true)
                  }}
                  onDragLeave={(event) => {
                    const nextTarget = event.relatedTarget as Node | null
                    if (!event.currentTarget.contains(nextTarget)) {
                      setIsEffectDropActive(false)
                    }
                  }}
                  onDrop={(event) => void handleEffectImageDrop(event)}
                  aria-busy={uploadingEffectImage}
                  aria-disabled={uploadingEffectImage}
                >
                  <div
                    className={`relative h-[340px] overflow-hidden rounded-[26px] border transition-all duration-300 ${
                      isEffectDropActive
                        ? "border-[#cde7e4] bg-[linear-gradient(180deg,#f9fffe_0%,#ffffff_100%)]"
                        : "border-[#eceef3] bg-[#fefefe]"
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div
                        className={`absolute inset-0 bg-[radial-gradient(72%_56%_at_50%_0%,rgba(130,224,214,0.28)_0%,rgba(130,224,214,0)_72%)] ${
                          uploadingEffectImage ? "animate-upload-glow" : ""
                        }`}
                      />
                      <div className="absolute -left-1/2 top-0 h-full w-1/2 bg-[linear-gradient(100deg,rgba(255,255,255,0)_0%,rgba(153,235,229,0.42)_50%,rgba(255,255,255,0)_100%)] animate-upload-shimmer" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
                      <div className="relative h-[178px] w-[224px]">
                        <div className="absolute left-1/2 top-3 h-[88px] w-[104px] -translate-x-1/2">
                          <div className={`relative h-full w-full ${uploadingEffectImage ? "animate-upload-doc-uploading" : "animate-upload-doc-idle"}`}>
                            <div className="absolute -left-4 top-2 h-[70px] w-[78px] rounded-[10px] border border-[#edf0f6] bg-white shadow-[0_8px_14px_rgba(24,35,52,0.08)]" />
                            <div className="absolute -right-4 top-3 h-[68px] w-[76px] rounded-[10px] border border-[#edf0f6] bg-white shadow-[0_8px_14px_rgba(24,35,52,0.08)]" />
                            <div className="relative h-full w-full rounded-[12px] border border-[#e9edf4] bg-white shadow-[0_12px_20px_rgba(20,33,55,0.1)]">
                              <div className="absolute right-[3px] top-[3px] h-[12px] w-[12px] rotate-45 border-b border-l border-[#e8ebf3] bg-[#f7f9fc]" />
                              <div className="absolute left-1/2 top-[28px] flex h-[36px] w-[36px] -translate-x-1/2 items-center justify-center rounded-[9px] bg-[linear-gradient(140deg,#8f98a8_0%,#adb5c3_55%,#bfc7d4_100%)] text-[20px] font-semibold text-white">
                                x
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="absolute inset-0 flex items-end justify-center pb-[6px]">
                          <div
                            className={`relative h-[94px] w-[178px] rounded-[15px] border ${
                              uploadingEffectImage
                                ? "border-[#68d2cc] bg-[linear-gradient(155deg,#8ee6de_0%,#67d9d1_38%,#4dc9c1_100%)] shadow-[0_18px_30px_rgba(50,190,180,0.32)] animate-upload-folder-breathe"
                                : "border-[#f0f1f5] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] opacity-0"
                            }`}
                          >
                            <div className="absolute left-[14px] top-[-9px] h-[12px] w-[58px] rounded-t-[8px] border border-b-0 border-[#7cd8d2] bg-[#95e8e1]" />
                            <div className="absolute left-[16px] top-[16px] h-[20px] w-[20px] rounded-full bg-[rgba(255,255,255,0.34)]" />
                            <p className="absolute left-[44px] top-[18px] text-[12px] font-semibold text-white/92">Imported</p>
                            <p className="absolute left-[44px] top-[38px] text-[11px] font-medium text-white/86">
                              {uploadingRecordsCount.toLocaleString()} records
                            </p>
                          </div>
                        </div>

                        <div
                          className={`pointer-events-none absolute right-[14px] top-[78px] h-[62px] w-[48px] rounded-[9px] border border-[#e7eaf2] bg-white shadow-[0_10px_18px_rgba(18,31,49,0.12)] transition-all duration-300 ${
                            isEffectDropActive && !uploadingEffectImage ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                          }`}
                        >
                          <div className="absolute right-[6px] top-[5px] h-[10px] w-[10px] rotate-45 border-b border-l border-[#e6ebf3] bg-[#f7f9fc]" />
                          <span className="absolute bottom-[8px] left-[10px] text-[11px] font-semibold text-[#7d8598]">CSV</span>
                        </div>
                      </div>

                      {uploadingEffectImage ? (
                        <div className="mt-2 flex items-center gap-2 text-[15px] font-semibold text-[#2e323a]">
                          <span className="h-4 w-4 rounded-full border-2 border-[#c8ece8] border-t-[#4ac7bf] animate-upload-spinner-spin" />
                          {copy.uploadingImage}
                        </div>
                      ) : (
                        <>
                          <p className="mt-2 text-[15px] font-semibold text-[#2f3440]">{copy.uploadImage}</p>
                          <p className="mt-1 text-xs text-[#808593]">{isEffectDropActive ? copy.dropToUpload : copy.uploadImageHint}</p>
                          <p className="mt-1 text-xs text-[#999ead]">{copy.imageLimitHint}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    ref={effectImageInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => void handleEffectImageUpload(event)}
                    disabled={uploadingEffectImage}
                  />
                </div>
              ) : (
                <div className="rounded-[18px] border border-[#d3d3d3] bg-white/70 p-4 text-center text-sm text-[#666666]">
                  {copy.imageLimitHint}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </form>
  )
}

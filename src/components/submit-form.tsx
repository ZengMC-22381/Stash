/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import type { Locale } from "@/lib/locale"

interface Category {
  id: string
  name: string
  slug: string
}

type Props = {
  locale: Locale
}

export default function SubmitForm({ locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          uploadNeedLogin: "请先登录后再上传图片。",
          uploadFailed: "图片上传失败。",
          submitNeedLogin: "请先登录后再投稿。",
          submitFailed: "投稿失败，请稍后重试。",
          publishedPrefix: "发布成功，查看链接：",
          title: "标题",
          titlePlaceholder: "Nimbus SaaS 新手引导",
          desc: "简要描述",
          descPlaceholder: "描述这个 DESIGN.md 主要解决的设计目标。",
          content: "DESIGN.md 内容",
          tags: "标签",
          tagsPlaceholder: "SaaS, 仪表盘, 极简",
          category: "分类",
          selectCategory: "请选择分类",
          imageUrls: "效果图 URL",
          imageUrlsPlaceholder: "粘贴图片链接（逗号或换行分隔）",
          uploadImages: "上传图片",
          selectFiles: "选择文件",
          filesSelected: "已选择",
          noFiles: "未选择文件",
          remove: "移除",
          publishing: "发布中...",
          publish: "发布 DESIGN.md",
        }
      : {
          uploadNeedLogin: "Please sign in before uploading images.",
          uploadFailed: "Image upload failed.",
          submitNeedLogin: "Please sign in before submitting.",
          submitFailed: "Submission failed.",
          publishedPrefix: "Published! View at ",
          title: "Title",
          titlePlaceholder: "Nimbus SaaS Onboarding",
          desc: "Short Description",
          descPlaceholder: "Describe what the prompt is optimized for.",
          content: "DESIGN.md Content",
          tags: "Tags",
          tagsPlaceholder: "SaaS, Dashboard, Minimal",
          category: "Category",
          selectCategory: "Select a category",
          imageUrls: "Output Image URLs",
          imageUrlsPlaceholder: "Paste image URLs (comma or newline separated)",
          uploadImages: "Upload Images",
          selectFiles: "Select files",
          filesSelected: "selected",
          noFiles: "No files selected",
          remove: "Remove",
          publishing: "Publishing...",
          publish: "Publish DESIGN.md",
        }

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    tags: "",
    category: "",
    images: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/categories")
        if (!res.ok) return
        const data = await res.json()
        setCategories(data.categories || [])
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previews])

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || [])
    previews.forEach((url) => URL.revokeObjectURL(url))
    setFiles(selected)
    setPreviews(selected.map((file) => URL.createObjectURL(file)))
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target)
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const remoteImages = form.images
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)

    try {
      let uploadedUrls: string[] = []
      if (files.length) {
        const formData = new FormData()
        files.forEach((file) => formData.append("files", file))
        const uploadRes = await fetch("/api/uploads", { method: "POST", body: formData })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          if (uploadRes.status === 401) {
            setMessage(copy.uploadNeedLogin)
          } else {
            setMessage(uploadData.error || copy.uploadFailed)
          }
          return
        }
        uploadedUrls = uploadData.urls || []
      }

      const images = [...uploadedUrls, ...remoteImages]

      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          content: form.content,
          tags: form.tags,
          categorySlug: form.category,
          images,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          setMessage(copy.submitNeedLogin)
        } else {
          setMessage(data.error || copy.submitFailed)
        }
        return
      }

      setMessage(`${copy.publishedPrefix}/designs/${data.design.slug}`)
      setForm({ title: "", description: "", content: "", tags: "", category: "", images: "" })
      setFiles([])
      setPreviews([])
    } catch {
      setMessage(copy.submitFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[800px] space-y-6 rounded-3xl border border-border bg-white p-8 shadow-soft">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">{copy.title}</label>
        <input
          value={form.title}
          onChange={handleChange("title")}
          placeholder={copy.titlePlaceholder}
          className="h-11 w-full rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">{copy.desc}</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={handleChange("description")}
          placeholder={copy.descPlaceholder}
          className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">{copy.content}</label>
        <textarea
          rows={10}
          value={form.content}
          onChange={handleChange("content")}
          placeholder="# DESIGN.md\n\n## Purpose\n..."
          className="w-full rounded-2xl border border-border bg-[#0F0F17] px-4 py-3 font-mono text-xs text-slate-200 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{copy.tags}</label>
          <input
            value={form.tags}
            onChange={handleChange("tags")}
            placeholder={copy.tagsPlaceholder}
            className="h-11 w-full rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{copy.category}</label>
          <select
            value={form.category}
            onChange={handleChange("category")}
            className="h-11 w-full rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          >
            <option value="">{copy.selectCategory}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">{copy.imageUrls}</label>
        <textarea
          rows={3}
          value={form.images}
          onChange={handleChange("images")}
          placeholder={copy.imageUrlsPlaceholder}
          className="w-full rounded-2xl border border-border px-4 py-3 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-700">{copy.uploadImages}</label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex h-11 cursor-pointer items-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-slate-700 shadow-soft">
            {copy.selectFiles}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFilesChange}
            />
          </label>
          <span className="text-xs text-slate-500">
            {files.length ? `${files.length} ${copy.filesSelected}` : copy.noFiles}
          </span>
        </div>
        {previews.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {previews.map((src, index) => (
              <div key={src} className="relative overflow-hidden rounded-2xl border border-border bg-muted">
                <img src={src} alt={`Upload preview ${index + 1}`} className="h-40 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700"
                >
                  {copy.remove}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-float"
        >
          {loading ? copy.publishing : copy.publish}
        </button>
        {message ? <span className="text-sm text-slate-600">{message}</span> : null}
      </div>
    </form>
  )
}

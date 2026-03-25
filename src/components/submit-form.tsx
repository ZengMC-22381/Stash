/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState } from "react"
import type { Locale } from "@/lib/locale"

interface Category {
  id: string
  name: string
  slug: string
}

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

const emptyDictionary: ResourceDictionary = {
  resourceTypes: [],
  tools: [],
  tags: [],
  scenarios: [],
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
          descPlaceholder: "描述这个资源主要解决的设计目标。",
          content: "资源内容（支持 .md）",
          resourceType: "资源类型",
          selectResourceType: "请选择资源类型",
          toolAgent: "工具 / Agents",
          selectToolAgent: "请选择工具 / Agents",
          scenario: "场景",
          selectScenario: "请选择场景",
          dictionaryTag: "标签（字典）",
          selectDictionaryTag: "请选择标签",
          tags: "自定义标签",
          tagsPlaceholder: "可继续补充标签，逗号分隔",
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
          publish: "发布资源",
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
          descPlaceholder: "Describe what this resource is optimized for.",
          content: "Resource Content (.md supported)",
          resourceType: "Resource Type",
          selectResourceType: "Select resource type",
          toolAgent: "Tool / Agent",
          selectToolAgent: "Select tool / agent",
          scenario: "Scenario",
          selectScenario: "Select scenario",
          dictionaryTag: "Dictionary Tag",
          selectDictionaryTag: "Select dictionary tag",
          tags: "Custom Tags",
          tagsPlaceholder: "Add extra tags, comma separated",
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
          publish: "Publish Resource",
        }

  const [categories, setCategories] = useState<Category[]>([])
  const [dictionary, setDictionary] = useState<ResourceDictionary>(emptyDictionary)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    resourceType: "design-md",
    toolAgent: "",
    scenario: "",
    dictionaryTag: "",
    tags: "",
    category: "",
    images: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [categoriesRes, dictionaryRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/resources/dictionary"),
        ])

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData.categories || [])
        }

        if (dictionaryRes.ok) {
          const dictionaryData = await dictionaryRes.json()
          const nextDictionary = dictionaryData.dictionary || emptyDictionary
          setDictionary(nextDictionary)

          if (Array.isArray(nextDictionary.resourceTypes) && nextDictionary.resourceTypes.length > 0) {
            setForm((prev) => ({
              ...prev,
              resourceType: prev.resourceType || nextDictionary.resourceTypes[0].value,
            }))
          }
        }
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

  const handleChange =
    (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const customTags = form.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)

    const tags = Array.from(new Set([...(form.dictionaryTag ? [form.dictionaryTag] : []), ...customTags]))

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

      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          content: form.content,
          resourceType: form.resourceType,
          toolAgent: form.toolAgent,
          scenario: form.scenario,
          tags,
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
      setForm({
        title: "",
        description: "",
        content: "",
        resourceType: dictionary.resourceTypes[0]?.value || "design-md",
        toolAgent: "",
        scenario: "",
        dictionaryTag: "",
        tags: "",
        category: "",
        images: "",
      })
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

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{copy.resourceType}</label>
          <select
            value={form.resourceType}
            onChange={handleChange("resourceType")}
            className="h-11 w-full rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          >
            <option value="">{copy.selectResourceType}</option>
            {dictionary.resourceTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{copy.toolAgent}</label>
          <select
            value={form.toolAgent}
            onChange={handleChange("toolAgent")}
            className="h-11 w-full rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          >
            <option value="">{copy.selectToolAgent}</option>
            {dictionary.tools.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{copy.scenario}</label>
          <select
            value={form.scenario}
            onChange={handleChange("scenario")}
            className="h-11 w-full rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          >
            <option value="">{copy.selectScenario}</option>
            {dictionary.scenarios.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{copy.dictionaryTag}</label>
          <select
            value={form.dictionaryTag}
            onChange={handleChange("dictionaryTag")}
            className="h-11 w-full rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          >
            <option value="">{copy.selectDictionaryTag}</option>
            {dictionary.tags.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
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
        <label className="text-sm font-semibold text-slate-700">{copy.tags}</label>
        <input
          value={form.tags}
          onChange={handleChange("tags")}
          placeholder={copy.tagsPlaceholder}
          className="h-11 w-full rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
        />
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

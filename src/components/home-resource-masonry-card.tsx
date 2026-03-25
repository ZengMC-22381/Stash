/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { Locale } from "@/lib/locale"

type ResourceTag = {
  slug?: string
  name?: string
}

type ResourceImage = {
  url: string
  caption?: string | null
}

export type HomeResourceFeedItem = {
  id: string
  slug: string
  title: string
  description: string
  author: {
    name: string
    handle: string
  }
  tags?: ResourceTag[] | string[]
  images?: ResourceImage[]
  stats: {
    likes?: number
    views?: number
  }
}

type Props = {
  resource: HomeResourceFeedItem
  locale: Locale
}

const FALLBACK_GRADIENTS = [
  "from-[#E8E0FF] via-[#F4F8FF] to-white",
  "from-[#DFF7F1] via-[#F4FFFA] to-white",
  "from-[#FFE1EE] via-[#FFF6FB] to-white",
  "from-[#EEF2FF] via-white to-white",
]

function hashInput(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 2147483647
  }
  return Math.abs(hash)
}

export default function HomeResourceMasonryCard({ resource, locale }: Props) {
  const [imageIndex, setImageIndex] = useState(0)
  const resourceLink = `/resources/${resource.slug}`

  const previewImages = useMemo(
    () =>
      (resource.images || [])
        .filter((image) => Boolean(image.url))
        .slice(0, 3)
        .map((image, index) => ({
          url: image.url,
          caption:
            image.caption ||
            (locale === "zh" ? `效果图 ${index + 1}` : `Preview ${index + 1}`),
        })),
    [locale, resource.images]
  )

  useEffect(() => {
    setImageIndex(0)
  }, [resource.id])

  const activeImage = previewImages[imageIndex]
  const canSwitch = previewImages.length > 1
  const fallbackTone = FALLBACK_GRADIENTS[hashInput(resource.id) % FALLBACK_GRADIENTS.length]
  const authorInitial = resource.author.name?.trim()?.charAt(0)?.toUpperCase() || "G"

  const nextImage = () => {
    if (!canSwitch) return
    setImageIndex((current) => (current + 1) % previewImages.length)
  }

  const prevImage = () => {
    if (!canSwitch) return
    setImageIndex((current) => (current - 1 + previewImages.length) % previewImages.length)
  }

  return (
    <article className="group space-y-4 break-inside-avoid">
      <div className="relative overflow-hidden rounded-[40px] border border-[rgba(175,178,179,0.1)] bg-white p-px shadow-[0px_20px_40px_-5px_rgba(47,51,52,0.06)]">
        <Link href={resourceLink} className="block rounded-[24px]">
          {activeImage ? (
            <img
              src={activeImage.url}
              alt={activeImage.caption}
              className="h-[clamp(220px,24vw,360px)] w-full rounded-[24px] object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className={`h-[clamp(220px,24vw,360px)] rounded-[24px] bg-gradient-to-br ${fallbackTone}`} />
          )}
        </Link>

        {canSwitch ? (
          <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
            <button
              type="button"
              aria-label={locale === "zh" ? "上一张效果图" : "Previous image"}
              onClick={prevImage}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-black/40 text-white backdrop-blur transition hover:bg-black/55"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={locale === "zh" ? "下一张效果图" : "Next image"}
              onClick={nextImage}
              className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-black/40 text-white backdrop-blur transition hover:bg-black/55"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {previewImages.length > 1 ? (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur">
            {previewImages.map((image, index) => (
              <span
                key={`${image.url}-${index}`}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  imageIndex === index ? "bg-white" : "bg-white/45"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-start justify-between gap-4 pl-1">
        <div className="min-w-0">
          <Link href={resourceLink} className="line-clamp-1 text-[20px] font-semibold leading-7 text-[#2f3334]">
            {resource.title}
          </Link>
          <p className="mt-1 line-clamp-1 text-sm leading-5 text-[#5c6060]">{resource.description}</p>
        </div>

        <Link
          href={resourceLink}
          aria-label={locale === "zh" ? "查看资源详情" : "View resource details"}
          className="mt-0.5 shrink-0 rounded-full border-2 border-[#f3f4f4] p-[2px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97] text-[11px] font-semibold text-white">
            {authorInitial}
          </span>
        </Link>
      </div>
    </article>
  )
}

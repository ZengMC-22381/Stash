/* eslint-disable @next/next/no-img-element */
"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { Locale } from "@/lib/locale"

type ResourceImage = {
  url: string
  caption?: string
}

type Props = {
  images: ResourceImage[]
  title: string
  locale: Locale
}

const PAGE_SIZE = 2
const AUTO_TURN_MS = 4500
const FALLBACK_GRADIENTS = [
  "from-[#dbe2e5] via-[#e7ecef] to-[#f3f5f6]",
  "from-[#d8dce3] via-[#e4e8ed] to-[#f4f6f8]",
]

function toImagePages(images: ResourceImage[]) {
  const validImages = images.filter((item) => Boolean(item.url))
  if (validImages.length === 0) {
    return [[null, null] as Array<ResourceImage | null>]
  }

  const pages: Array<Array<ResourceImage | null>> = []
  for (let index = 0; index < validImages.length; index += PAGE_SIZE) {
    const page: Array<ResourceImage | null> = validImages.slice(index, index + PAGE_SIZE)
    while (page.length < PAGE_SIZE) {
      page.push(null)
    }
    pages.push(page)
  }
  return pages
}

export default function ResourcePreviewPager({ images, title, locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          label: "效果图预览",
          previous: "上一页",
          next: "下一页",
          placeholder: "等待上传效果图",
          preview: "效果图",
        }
      : {
          label: "Visual Preview",
          previous: "Previous page",
          next: "Next page",
          placeholder: "Preview will appear here",
          preview: "Preview",
        }

  const pages = useMemo(() => toImagePages(images), [images])
  const [pageIndex, setPageIndex] = useState(0)

  useEffect(() => {
    setPageIndex(0)
  }, [pages.length])

  useEffect(() => {
    if (pages.length <= 1) {
      return
    }

    const timer = window.setInterval(() => {
      setPageIndex((current) => (current + 1) % pages.length)
    }, AUTO_TURN_MS)

    return () => window.clearInterval(timer)
  }, [pages.length])

  const goPrev = () => {
    setPageIndex((current) => (current - 1 + pages.length) % pages.length)
  }

  const goNext = () => {
    setPageIndex((current) => (current + 1) % pages.length)
  }

  const currentPage = pages[pageIndex]

  return (
    <section className="relative bg-[#f9f9f9] lg:min-h-[calc(100vh-65px)]">
      <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-[rgba(97,91,124,0.1)] blur-[50px]" />
      <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-[rgba(109,90,96,0.1)] blur-[50px]" />

      <div className="relative flex h-full flex-col px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#71717a]">{copy.label}</span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(209,209,209,1)] bg-white text-[#333333] transition hover:border-[#333333] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={copy.previous}
              disabled={pages.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(209,209,209,1)] bg-white text-[#333333] transition hover:border-[#333333] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={copy.next}
              disabled={pages.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid flex-1 grid-rows-2 gap-5 lg:gap-6">
          {currentPage.map((image, index) => {
            if (!image) {
              const tone = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]
              return (
                <div
                  key={`placeholder-${index}`}
                  className={`flex min-h-[220px] items-center justify-center rounded-[40px] bg-gradient-to-br ${tone}`}
                >
                  <span className="text-sm text-[#71717a]">{copy.placeholder}</span>
                </div>
              )
            }

            const imageLabel = image.caption || `${copy.preview} ${pageIndex * PAGE_SIZE + index + 1}`
            return (
              <div key={image.url} className="min-h-[220px] overflow-hidden rounded-[40px] bg-[#e4e4e7]">
                <img src={image.url} alt={`${title} - ${imageLabel}`} className="h-full w-full object-cover" />
              </div>
            )
          })}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          {pages.map((_, index) => (
            <span
              key={`page-dot-${index}`}
              className={`h-1.5 w-6 rounded-full transition ${
                pageIndex === index ? "bg-[#333333]" : "bg-[#cbd5e1]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

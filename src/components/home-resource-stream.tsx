"use client"

import { Funnel } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import HomeResourceMasonryCard, { type HomeResourceFeedItem } from "@/components/home-resource-masonry-card"
import type { Locale } from "@/lib/locale"
import {
  RESOURCE_SCENARIO_OPTIONS,
  RESOURCE_TAG_OPTIONS,
  RESOURCE_TOOL_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
} from "@/lib/resource-definition"

type SortKey = "latest" | "popular" | "liked"

type FilterState = {
  resourceType: string | null
  tool: string | null
  tag: string | null
  scenario: string | null
}

type FilterKey = keyof FilterState

type DirectoryOption = {
  value: string
  label: string
}

const PAGE_SIZE = 12
const DIRECTORY_LIMIT = 5
const INITIAL_FILTERS: FilterState = {
  resourceType: null,
  tool: null,
  tag: null,
  scenario: null,
}

type Props = {
  locale: Locale
}

export default function HomeResourceStream({ locale }: Props) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [sort, setSort] = useState<SortKey>("latest")
  const [resources, setResources] = useState<HomeResourceFeedItem[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const requestIdRef = useRef(0)

  const copy =
    locale === "zh"
      ? {
          directory: "目录",
          resourceType: "资源类型",
          tool: "工具 / Agents",
          tag: "标签",
          scenario: "场景",
          latest: "最新",
          popular: "最受欢迎",
          liked: "最高赞",
          filter: "Filter",
          loading: "正在加载资源...",
          loadingMore: "正在加载更多资源...",
          loadFailed: "资源加载失败，请稍后重试。",
          noResources: "暂无可展示资源。",
        }
      : {
          directory: "Directory",
          resourceType: "Resource Type",
          tool: "Tool / Agents",
          tag: "Tags",
          scenario: "Scenario",
          latest: "Latest",
          popular: "Most Popular",
          liked: "Most Liked",
          filter: "Filter",
          loading: "Loading resources...",
          loadingMore: "Loading more...",
          loadFailed: "Failed to load resources. Please try again later.",
          noResources: "No resources yet.",
        }

  const directoryColumns: Array<{ key: FilterKey; title: string; options: DirectoryOption[] }> = useMemo(
    () => [
      {
        key: "resourceType",
        title: copy.resourceType,
        options: RESOURCE_TYPE_OPTIONS.slice(0, DIRECTORY_LIMIT),
      },
      {
        key: "tool",
        title: copy.tool,
        options: RESOURCE_TOOL_OPTIONS.slice(0, DIRECTORY_LIMIT),
      },
      {
        key: "tag",
        title: copy.tag,
        options: RESOURCE_TAG_OPTIONS.slice(0, DIRECTORY_LIMIT),
      },
      {
        key: "scenario",
        title: copy.scenario,
        options: RESOURCE_SCENARIO_OPTIONS.slice(0, DIRECTORY_LIMIT),
      },
    ],
    [copy.resourceType, copy.scenario, copy.tag, copy.tool]
  )

  const sortOptions: Array<{ key: SortKey; label: string }> = useMemo(
    () => [
      { key: "latest", label: copy.latest },
      { key: "popular", label: copy.popular },
      { key: "liked", label: copy.liked },
    ],
    [copy.latest, copy.liked, copy.popular]
  )

  const fetchResources = useCallback(
    async (skip: number, signal?: AbortSignal) => {
      const params = new URLSearchParams({
        take: String(PAGE_SIZE),
        skip: String(skip),
        sort,
      })

      if (filters.resourceType) params.set("resourceType", filters.resourceType)
      if (filters.tool) params.set("tool", filters.tool)
      if (filters.tag) params.set("tag", filters.tag)
      if (filters.scenario) params.set("scenario", filters.scenario)

      const res = await fetch(`/api/resources?${params.toString()}`, {
        cache: "no-store",
        signal,
      })

      if (!res.ok) throw new Error(`Failed to load resources: ${res.status}`)
      const data = await res.json()
      return (data.resources || data.designs || []) as HomeResourceFeedItem[]
    },
    [filters.resourceType, filters.scenario, filters.tag, filters.tool, sort]
  )

  useEffect(() => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    const controller = new AbortController()

    setIsLoadingInitial(true)
    setIsLoadingMore(false)
    setError(null)
    setHasMore(true)
    setResources([])

    fetchResources(0, controller.signal)
      .then((next) => {
        if (requestIdRef.current !== requestId) return
        setResources(next)
        setHasMore(next.length === PAGE_SIZE)
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        if (requestIdRef.current !== requestId) return
        console.error("[HOME_RESOURCES_INITIAL]", reason)
        setHasMore(false)
        setError(copy.loadFailed)
      })
      .finally(() => {
        if (requestIdRef.current === requestId) {
          setIsLoadingInitial(false)
        }
      })

    return () => controller.abort()
  }, [copy.loadFailed, fetchResources])

  const loadMore = useCallback(async () => {
    if (isLoadingInitial || isLoadingMore || !hasMore) return

    const requestId = requestIdRef.current
    setIsLoadingMore(true)
    setError(null)

    try {
      const next = await fetchResources(resources.length)
      if (requestIdRef.current !== requestId) return
      setResources((prev) => {
        const seenIds = new Set(prev.map((item) => item.id))
        const merged = [...prev]
        for (const item of next) {
          if (!seenIds.has(item.id)) {
            merged.push(item)
          }
        }
        return merged
      })
      setHasMore(next.length === PAGE_SIZE)
    } catch (reason: unknown) {
      if (requestIdRef.current !== requestId) return
      console.error("[HOME_RESOURCES_LOAD_MORE]", reason)
      setError(copy.loadFailed)
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoadingMore(false)
      }
    }
  }, [copy.loadFailed, fetchResources, hasMore, isLoadingInitial, isLoadingMore, resources.length])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting) {
          void loadMore()
        }
      },
      { rootMargin: "320px 0px 320px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  const toggleFilter = (key: FilterKey, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }))
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6 px-6 pb-16 lg:px-12">
      <section className="space-y-7 pt-12">
        <h2 className="text-[48px] font-semibold leading-[48px] tracking-[-0.05em] text-[#2f3334]">{copy.directory}</h2>
        <div className="grid gap-x-12 gap-y-10 border-t border-[rgba(175,178,179,0.1)] pt-[49px] sm:grid-cols-2 lg:grid-cols-4">
          {directoryColumns.map((column) => (
            <div key={column.key} className="space-y-6">
              <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.025em] text-[#2f3334]">{column.title}</h3>
              <div className="space-y-3">
                {column.options.map((option) => {
                  const active = filters[column.key] === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleFilter(column.key, option.value)}
                      className={`block text-left text-[16px] leading-6 transition ${
                        active ? "font-semibold text-[#2f3334]" : "text-[#5c6060] hover:text-[#2f3334]"
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex min-h-[44px] flex-wrap items-center justify-end gap-0 px-1">
          <div className="flex items-center gap-6 text-[14px] leading-5">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSort(option.key)}
                className={`px-0 transition ${
                  sort === option.key ? "font-semibold text-[#2f3334]" : "font-normal text-[#5c6060] hover:text-[#2f3334]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="mx-6 h-4 w-px bg-[rgba(175,178,179,0.3)]" />
          <button
            type="button"
            aria-label={copy.filter}
            className="inline-flex items-center gap-2 text-[14px] font-semibold leading-5 text-[#2f3334]"
          >
            <Funnel className="h-3.5 w-3.5" />
            {copy.filter}
          </button>
        </div>

        {isLoadingInitial ? (
          <div className="columns-1 gap-8 md:columns-2 xl:columns-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="mb-8 break-inside-avoid animate-pulse rounded-[36px] border border-border bg-white p-4">
                <div className="h-[240px] rounded-[28px] bg-[#f3f4f4]" />
                <div className="mt-5 h-6 w-2/3 rounded-full bg-[#f3f4f4]" />
                <div className="mt-3 h-4 w-1/2 rounded-full bg-[#f3f4f4]" />
              </div>
            ))}
          </div>
        ) : resources.length ? (
          <div className="columns-1 gap-8 md:columns-2 xl:columns-3">
            {resources.map((resource) => (
              <div key={resource.id} className="mb-8 break-inside-avoid">
                <HomeResourceMasonryCard resource={resource} locale={locale} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-border bg-white p-6 text-sm text-slate-600">{copy.noResources}</div>
        )}

        {error ? <p className="px-1 text-sm text-[#b91c1c]">{error}</p> : null}
        {isLoadingMore ? <p className="px-1 text-sm text-[#5c6060]">{copy.loadingMore}</p> : null}
        {isLoadingInitial ? <p className="sr-only">{copy.loading}</p> : null}
        <div ref={sentinelRef} className="h-1 w-full" />
      </section>
    </div>
  )
}

"use client"

import { Funnel, Search, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState, type WheelEvent as ReactWheelEvent } from "react"
import HomeResourceMasonryCard, { type HomeResourceFeedItem } from "@/components/home-resource-masonry-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Locale } from "@/lib/locale"
import {
  RESOURCE_SCENARIO_OPTIONS,
  RESOURCE_TAG_OPTIONS,
  RESOURCE_TOOL_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
} from "@/lib/resource-definition"

type SortKey = "latest" | "popular" | "liked"

type FilterState = {
  resourceType: string[]
  tool: string[]
  tag: string[]
  scenario: string[]
}

type FilterKey = keyof FilterState

type DirectoryOption = {
  value: string
  label: string
}

type FilterColumnMeta = {
  key: FilterKey
  title: string
}

type PreviewItem = {
  id: string
  title: string
  description: string
  imageUrl: string | null
}

const PAGE_SIZE = 12
const DIRECTORY_LIMIT = 5
const MAX_SELECT_PER_GROUP = 3

const INITIAL_FILTERS: FilterState = {
  resourceType: [],
  tool: [],
  tag: [],
  scenario: [],
}

const FILTER_PARAM_KEY: Record<FilterKey, string> = {
  resourceType: "resourceType",
  tool: "tool",
  tag: "tag",
  scenario: "scenario",
}

const FILTER_OPTIONS: Record<FilterKey, DirectoryOption[]> = {
  resourceType: RESOURCE_TYPE_OPTIONS,
  tool: RESOURCE_TOOL_OPTIONS,
  tag: RESOURCE_TAG_OPTIONS,
  scenario: RESOURCE_SCENARIO_OPTIONS,
}

type Props = {
  locale: Locale
}

function previewDescription(locale: Locale, key: FilterKey, label: string) {
  if (locale === "zh") {
    if (key === "resourceType" && label === "DESIGN.md") {
      return "搜寻好看好用的DESIGN.md文件"
    }
    return `查看 ${label} 分类下最热门的资源效果图`
  }

  if (key === "resourceType" && label === "DESIGN.md") {
    return "Find the most useful and beautiful DESIGN.md resources"
  }
  return `Explore top resources in ${label}`
}

function toPreviewItems(input: HomeResourceFeedItem[]) {
  return input.slice(0, 3).map((resource) => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    imageUrl: resource.images?.find((image) => Boolean(image.url))?.url || null,
  }))
}

export default function HomeResourceStream({ locale }: Props) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [sort, setSort] = useState<SortKey>("latest")
  const [resources, setResources] = useState<HomeResourceFeedItem[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isFilterExpanded, setIsFilterExpanded] = useState(false)
  const [activeFilterKey, setActiveFilterKey] = useState<FilterKey | null>(null)
  const [filterSearch, setFilterSearch] = useState("")
  const [hoveredOptionValue, setHoveredOptionValue] = useState<string | null>(null)
  const [hoveredDirectory, setHoveredDirectory] = useState<{ key: FilterKey; value: string } | null>(null)
  const [limitNotice, setLimitNotice] = useState<string | null>(null)
  const [conditionMask, setConditionMask] = useState({ left: false, right: false })

  const [previewCache, setPreviewCache] = useState<Record<string, PreviewItem[]>>({})
  const [loadingPreviewKey, setLoadingPreviewKey] = useState<string | null>(null)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const requestIdRef = useRef(0)
  const filterPanelRef = useRef<HTMLDivElement | null>(null)
  const conditionScrollRef = useRef<HTMLDivElement | null>(null)

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
          searchCategory: "搜索分类...",
          loading: "正在加载资源...",
          loadingMore: "正在加载更多资源...",
          loadFailed: "资源加载失败，请稍后重试。",
          noResources: "暂无可展示资源。",
          maxSelect: `每个条件最多选择 ${MAX_SELECT_PER_GROUP} 项。`,
          clearAll: "清空",
          any: "未选择",
          previewEmpty: "该分类下暂无可展示资源。",
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
          searchCategory: "Search categories...",
          loading: "Loading resources...",
          loadingMore: "Loading more...",
          loadFailed: "Failed to load resources. Please try again later.",
          noResources: "No resources yet.",
          maxSelect: `You can select up to ${MAX_SELECT_PER_GROUP} items in each group.`,
          clearAll: "Clear",
          any: "Any",
          previewEmpty: "No resources available for this option yet.",
        }

  const filterColumns: FilterColumnMeta[] = useMemo(
    () => [
      { key: "resourceType", title: copy.resourceType },
      { key: "tool", title: copy.tool },
      { key: "tag", title: copy.tag },
      { key: "scenario", title: copy.scenario },
    ],
    [copy.resourceType, copy.scenario, copy.tag, copy.tool]
  )

  const directoryColumns = useMemo(
    () =>
      filterColumns.map((column) => ({
        ...column,
        options: FILTER_OPTIONS[column.key].slice(0, DIRECTORY_LIMIT),
      })),
    [filterColumns]
  )

  const sortOptions: Array<{ key: SortKey; label: string }> = useMemo(
    () => [
      { key: "latest", label: copy.latest },
      { key: "popular", label: copy.popular },
      { key: "liked", label: copy.liked },
    ],
    [copy.latest, copy.liked, copy.popular]
  )

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((selected) => selected.length > 0),
    [filters]
  )

  const shouldShowFilterConditions = isFilterExpanded || hasActiveFilters

  const getOptionLabel = useCallback((key: FilterKey, value: string) => {
    return FILTER_OPTIONS[key].find((option) => option.value === value)?.label || value
  }, [])

  const activeOptions = useMemo(
    () => (activeFilterKey ? FILTER_OPTIONS[activeFilterKey] : []),
    [activeFilterKey]
  )

  const filteredActiveOptions = useMemo(() => {
    if (!filterSearch.trim()) {
      return activeOptions
    }

    const normalized = filterSearch.trim().toLowerCase()
    return activeOptions.filter((option) => {
      return (
        option.label.toLowerCase().includes(normalized) ||
        option.value.toLowerCase().includes(normalized)
      )
    })
  }, [activeOptions, filterSearch])

  const selectedValuesForActive = activeFilterKey ? filters[activeFilterKey] : []

  const previewOptionValue =
    hoveredOptionValue ||
    selectedValuesForActive[0] ||
    filteredActiveOptions[0]?.value ||
    null

  const previewCacheKey =
    activeFilterKey && previewOptionValue
      ? `${activeFilterKey}:${previewOptionValue}`
      : null

  const previewOptionLabel =
    activeFilterKey && previewOptionValue
      ? getOptionLabel(activeFilterKey, previewOptionValue)
      : ""

  const previewItems = previewCacheKey ? previewCache[previewCacheKey] || [] : []

  const conditionMaskImage = useMemo(() => {
    if (conditionMask.left && conditionMask.right) {
      return "linear-gradient(to right, transparent 0px, #000 12px, #000 calc(100% - 24px), transparent 100%)"
    }
    if (conditionMask.right) {
      return "linear-gradient(to right, #000 0px, #000 calc(100% - 24px), transparent 100%)"
    }
    if (conditionMask.left) {
      return "linear-gradient(to right, transparent 0px, #000 12px, #000 100%)"
    }
    return null
  }, [conditionMask.left, conditionMask.right])

  const fetchResources = useCallback(
    async (skip: number, signal?: AbortSignal) => {
      const params = new URLSearchParams({
        take: String(PAGE_SIZE),
        skip: String(skip),
        sort,
      })

      if (filters.resourceType.length > 0) {
        params.set("resourceType", filters.resourceType.join(","))
      }
      if (filters.tool.length > 0) {
        params.set("tool", filters.tool.join(","))
      }
      if (filters.tag.length > 0) {
        params.set("tag", filters.tag.join(","))
      }
      if (filters.scenario.length > 0) {
        params.set("scenario", filters.scenario.join(","))
      }

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

  useEffect(() => {
    if (!activeFilterKey) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (filterPanelRef.current && !filterPanelRef.current.contains(target)) {
        setActiveFilterKey(null)
        setFilterSearch("")
        setHoveredOptionValue(null)
      }
    }

    window.addEventListener("mousedown", handleClickOutside)
    return () => window.removeEventListener("mousedown", handleClickOutside)
  }, [activeFilterKey])

  useEffect(() => {
    if (!activeFilterKey || !previewOptionValue || !previewCacheKey) return
    if (previewCache[previewCacheKey]) return

    const controller = new AbortController()
    const params = new URLSearchParams({
      take: "3",
      skip: "0",
      sort: "popular",
      [FILTER_PARAM_KEY[activeFilterKey]]: previewOptionValue,
    })

    setLoadingPreviewKey(previewCacheKey)

    fetch(`/api/resources?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load preview: ${response.status}`)
        }
        const payload = await response.json()
        const list = (payload.resources || payload.designs || []) as HomeResourceFeedItem[]
        setPreviewCache((prev) => ({
          ...prev,
          [previewCacheKey]: toPreviewItems(list),
        }))
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return
        console.error("[HOME_FILTER_PREVIEW]", reason)
        setPreviewCache((prev) => ({
          ...prev,
          [previewCacheKey]: [],
        }))
      })
      .finally(() => {
        setLoadingPreviewKey((current) => (current === previewCacheKey ? null : current))
      })

    return () => controller.abort()
  }, [activeFilterKey, previewOptionValue, previewCache, previewCacheKey])

  const clearAllFilters = () => {
    setFilters(INITIAL_FILTERS)
    setLimitNotice(null)
  }

  const updateConditionMask = useCallback(() => {
    const container = conditionScrollRef.current
    if (!container) return

    const left = container.scrollLeft > 1
    const right = container.scrollLeft + container.clientWidth < container.scrollWidth - 1
    setConditionMask((prev) => {
      if (prev.left === left && prev.right === right) {
        return prev
      }
      return { left, right }
    })
  }, [])

  const toggleFilterValue = (key: FilterKey, value: string) => {
    let reachedLimit = false

    setFilters((prev) => {
      const selected = prev[key]
      if (selected.includes(value)) {
        return {
          ...prev,
          [key]: selected.filter((item) => item !== value),
        }
      }

      if (selected.length >= MAX_SELECT_PER_GROUP) {
        reachedLimit = true
        return prev
      }

      return {
        ...prev,
        [key]: [...selected, value],
      }
    })

    if (reachedLimit) {
      setLimitNotice(copy.maxSelect)
    } else {
      setLimitNotice(null)
    }
  }

  const ensureFilterValue = (key: FilterKey, value: string) => {
    let reachedLimit = false

    setFilters((prev) => {
      const selected = prev[key]
      if (selected.includes(value)) {
        return prev
      }

      if (selected.length >= MAX_SELECT_PER_GROUP) {
        reachedLimit = true
        return prev
      }

      return {
        ...prev,
        [key]: [...selected, value],
      }
    })

    if (reachedLimit) {
      setLimitNotice(copy.maxSelect)
    } else {
      setLimitNotice(null)
    }
  }

  const handleDirectoryClick = (key: FilterKey, value: string) => {
    setIsFilterExpanded(true)
    setActiveFilterKey(key)
    setFilterSearch("")
    setHoveredOptionValue(value)
    ensureFilterValue(key, value)
  }

  const handleFilterButtonClick = () => {
    if (isFilterExpanded) {
      setIsFilterExpanded(false)
      setActiveFilterKey(null)
      setFilterSearch("")
      setHoveredOptionValue(null)
      setLimitNotice(null)
      return
    }

    setIsFilterExpanded(true)
    setActiveFilterKey(null)
    setLimitNotice(null)
    setHoveredOptionValue(null)
    setFilterSearch("")
  }

  const openFilterCondition = (key: FilterKey) => {
    setIsFilterExpanded(true)
    setActiveFilterKey(key)
    setFilterSearch("")
    setHoveredOptionValue(filters[key][0] || null)
  }

  const handleConditionWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const container = conditionScrollRef.current
    if (!container) return

    const delta = event.deltaY !== 0 ? event.deltaY : event.deltaX
    const isOverflowing = container.scrollWidth > container.clientWidth
    if (!isOverflowing || delta === 0) return

    container.scrollLeft += delta
    event.preventDefault()
  }

  useEffect(() => {
    if (!shouldShowFilterConditions) {
      setConditionMask({ left: false, right: false })
      return
    }

    const raf = window.requestAnimationFrame(() => {
      updateConditionMask()
    })

    const handleResize = () => updateConditionMask()
    window.addEventListener("resize", handleResize)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", handleResize)
    }
  }, [filters, shouldShowFilterConditions, updateConditionMask])

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-6 px-6 pb-16 lg:px-12">
      <section id="directory-filter" className="scroll-mt-[92px] space-y-7 pt-12">
        <h2 className="text-[48px] font-semibold leading-[48px] tracking-[-0.05em] text-[#2f3334]">{copy.directory}</h2>
        <div className="grid gap-x-12 gap-y-10 border-t border-[rgba(175,178,179,0.1)] pt-[49px] sm:grid-cols-2 lg:grid-cols-4">
          {directoryColumns.map((column) => (
            <div key={column.key} className="space-y-6">
              <h3 className="text-[18px] font-semibold leading-7 tracking-[-0.025em] text-[#2f3334]">{column.title}</h3>
              <div className="space-y-3" onMouseLeave={() => setHoveredDirectory(null)}>
                {column.options.map((option) => {
                  const active = filters[column.key].includes(option.value)
                  const isHoveredOption =
                    hoveredDirectory?.key === column.key && hoveredDirectory.value === option.value
                  const isHoveringColumn = hoveredDirectory?.key === column.key
                  const shouldDim = isHoveringColumn && !isHoveredOption
                  return (
                    <Button variant="unstyled"
                      key={option.value}
                      type="button"
                      onMouseEnter={() => setHoveredDirectory({ key: column.key, value: option.value })}
                      onFocus={() => setHoveredDirectory({ key: column.key, value: option.value })}
                      onClick={() => handleDirectoryClick(column.key, option.value)}
                      className={`block text-left text-[16px] leading-6 transition-all duration-200 ${
                        shouldDim
                          ? "font-medium text-[#a8adb3]"
                          : isHoveredOption
                            ? "translate-x-[2px] font-semibold text-[#2f3334]"
                            : active
                              ? "font-semibold text-[#2f3334]"
                              : "text-[#5c6060] hover:text-[#2f3334]"
                      }`}
                    >
                      {option.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="relative" ref={filterPanelRef}>
          <div className="flex min-h-[44px] items-center gap-3 px-1">
            {shouldShowFilterConditions ? (
              <div className="relative min-w-0 flex-1">
                <div
                  ref={conditionScrollRef}
                  onWheel={handleConditionWheel}
                  onScroll={updateConditionMask}
                  className="flex items-center gap-2 overflow-x-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  style={
                    conditionMaskImage
                      ? {
                          WebkitMaskImage: conditionMaskImage,
                          maskImage: conditionMaskImage,
                        }
                      : undefined
                  }
                >
                  {filterColumns.map((column) => {
                    const selected = filters[column.key]
                    const isActiveCondition = activeFilterKey === column.key

                    return (
                      <Button variant="unstyled"
                        key={column.key}
                        type="button"
                        onClick={() => openFilterCondition(column.key)}
                        className={`inline-flex shrink-0 max-w-full items-center gap-1 rounded-full p-1 transition ${
                          isActiveCondition ? "bg-[#e5e7eb]" : "bg-[#f3f4f4]"
                        }`}
                      >
                        <span className="rounded-full px-3 py-2 text-[14px] font-semibold text-[#5c6060]">{column.title}</span>
                        {selected.map((value) => (
                          <span
                            key={`${column.key}-${value}`}
                            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[14px] font-medium text-[#5c6060] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                          >
                            {getOptionLabel(column.key, value)}
                            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#f3f4f4]">
                              <X className="h-3 w-3" />
                            </span>
                          </span>
                        ))}
                        {selected.length === 0 ? (
                          <span className="rounded-full bg-white px-3 py-2 text-[14px] text-[#9ca3af] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                            {copy.any}
                          </span>
                        ) : null}
                      </Button>
                    )
                  })}

                  {hasActiveFilters ? (
                    <Button variant="unstyled"
                      type="button"
                      onClick={clearAllFilters}
                      className="inline-flex shrink-0 items-center rounded-full px-3 py-2 text-[13px] font-medium text-[#6b7280]"
                    >
                      {copy.clearAll}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            <div className="ml-auto flex shrink-0 items-center gap-6 text-[14px] leading-5">
              {sortOptions.map((option) => (
                <Button variant="unstyled"
                  key={option.key}
                  type="button"
                  onClick={() => setSort(option.key)}
                  className={`px-0 transition ${
                    sort === option.key ? "font-semibold text-[#2f3334]" : "font-normal text-[#5c6060] hover:text-[#2f3334]"
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <span className="h-4 w-px shrink-0 bg-[rgba(175,178,179,0.3)]" />
            <Button variant="unstyled"
              type="button"
              aria-label={copy.filter}
              onClick={handleFilterButtonClick}
              className={`inline-flex items-center gap-2 text-[14px] leading-5 ${
                isFilterExpanded ? "font-semibold text-[#2f3334]" : "font-semibold text-[#5c6060]"
              }`}
            >
              <Funnel className="h-3.5 w-3.5" />
              {copy.filter}
            </Button>
          </div>

          {shouldShowFilterConditions ? (
            <div className="mt-3 space-y-3">
              {activeFilterKey ? (
                <div className="absolute left-0 top-full z-30 mt-2 hidden gap-4 lg:flex">
                  <div className="w-[320px] overflow-hidden rounded-[32px] border border-[rgba(255,255,255,0.1)] bg-[rgba(30,30,30,0.7)] px-px py-[17px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.5),0px_0px_0px_1px_rgba(255,255,255,0.1)] backdrop-blur-[16px]">
                    <div className="px-6 py-2">
                      <div className="relative overflow-hidden rounded-[48px] bg-[rgba(255,255,255,0.05)] pl-10 pr-4 pb-2 pt-[9px]">
                        <Search className="absolute left-3.5 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[rgba(255,255,255,0.35)]" />
                        <Input
                          value={filterSearch}
                          onChange={(event) => setFilterSearch(event.target.value)}
                          placeholder={copy.searchCategory}
                          className="w-full border-0 bg-transparent text-[14px] text-white outline-none placeholder:text-[rgba(255,255,255,0.3)]"
                        />
                      </div>
                    </div>

                    <div className="max-h-[270px] space-y-1 overflow-y-auto px-2">
                      {filteredActiveOptions.map((option) => {
                        const checked = filters[activeFilterKey].includes(option.value)
                        return (
                          <Button variant="unstyled"
                            key={option.value}
                            type="button"
                            onClick={() => toggleFilterValue(activeFilterKey, option.value)}
                            onMouseEnter={() => setHoveredOptionValue(option.value)}
                            className={`flex w-full items-center gap-2 rounded-[48px] px-4 py-3 text-left transition ${
                              checked
                                ? "border border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.4)] text-white"
                                : "text-white/90 hover:bg-[rgba(255,255,255,0.06)]"
                            }`}
                          >
                            <span
                              className={`inline-flex h-[14px] w-[14px] items-center justify-center rounded-[3.5px] border ${
                                checked
                                  ? "border-white bg-white text-[#333333]"
                                  : "border-white/85 text-transparent"
                              }`}
                            >
                              <span className="text-[9px] leading-none">✓</span>
                            </span>
                            <span className="text-[16px] leading-6">{option.label}</span>
                          </Button>
                        )
                      })}
                    </div>

                    {limitNotice ? <p className="px-6 pt-3 text-xs text-[#fda4af]">{limitNotice}</p> : null}
                  </div>

                  <div className="relative w-[440px] rounded-[32px] border border-[rgba(255,255,255,0.1)] bg-[rgba(30,30,30,0.7)] p-[25px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.5),0px_0px_0px_1px_rgba(255,255,255,0.1)] backdrop-blur-[16px]">
                    <div className="grid grid-cols-3 gap-3">
                      {(previewItems.length > 0 ? previewItems : Array.from({ length: 3 })).map((item, index) => {
                        const imageUrl = (item as PreviewItem | undefined)?.imageUrl || null
                        return (
                          <div
                            key={(item as PreviewItem | undefined)?.id || `placeholder-${index}`}
                            className="aspect-square overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.1)]"
                          >
                            {imageUrl ? (
                              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full bg-[linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))]" />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-6 space-y-2">
                      <p className="text-[30px] font-semibold leading-7 text-white">{previewOptionLabel}</p>
                      <p className="text-[14px] leading-[22px] text-white/60">
                        {previewOptionLabel && activeFilterKey
                          ? previewDescription(locale, activeFilterKey, previewOptionLabel)
                          : copy.previewEmpty}
                      </p>
                      {loadingPreviewKey === previewCacheKey ? (
                        <p className="pt-1 text-xs text-white/50">{copy.loadingMore}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
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

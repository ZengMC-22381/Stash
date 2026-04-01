"use client"

import { useEffect, useMemo, useState, type ComponentType } from "react"
import { Grid2x2, Palette, Search, Sparkles, Type, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Locale } from "@/lib/locale"
import type { SearchFacetItem, SearchTabId } from "@/lib/search-facets"

type Props = {
  locale: Locale
}

type TabId = SearchTabId

const tabs: Array<{ id: TabId; icon: ComponentType<{ className?: string }>; label: string }> = [
  { id: "types", icon: Grid2x2, label: "Types" },
  { id: "styles", icon: Palette, label: "Styles" },
  { id: "frameworks", icon: Sparkles, label: "Frameworks" },
  { id: "fonts", icon: Type, label: "Fonts" },
  { id: "platforms", icon: Grid2x2, label: "Platforms" },
]

const emptyFacets: Record<TabId, SearchFacetItem[]> = {
  types: [],
  styles: [],
  frameworks: [],
  fonts: [],
  platforms: [],
}

const emptySelection: Record<TabId, string[]> = {
  types: [],
  styles: [],
  frameworks: [],
  fonts: [],
  platforms: [],
}

function toSlugList(value: string | null) {
  if (!value) return []
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

function normalizeFacetItems(input: unknown): SearchFacetItem[] {
  if (!Array.isArray(input)) return []

  return input
    .map((item, index) => {
      if (!item || typeof item !== "object") return null
      const raw = item as Record<string, unknown>
      const slug = typeof raw.slug === "string" ? raw.slug.trim().toLowerCase() : ""
      const name = typeof raw.name === "string" ? raw.name.trim() : ""
      if (!slug || !name) return null
      const designCount =
        typeof raw.designCount === "number" && Number.isFinite(raw.designCount) ? raw.designCount : 0
      return {
        id: typeof raw.id === "string" ? raw.id : `${slug}-${index}`,
        slug,
        name,
        designCount,
      }
    })
    .filter((item): item is SearchFacetItem => Boolean(item))
}

export default function QuickSearchDock({ locale }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const enabled = pathname === "/" || pathname.startsWith("/explore")
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabId>("types")
  const [facets, setFacets] = useState<Record<TabId, SearchFacetItem[]>>(emptyFacets)
  const [selectedFacets, setSelectedFacets] = useState<Record<TabId, string[]>>(emptySelection)
  const [loadingFacets, setLoadingFacets] = useState(false)
  const [facetsLoaded, setFacetsLoaded] = useState(false)

  const copy =
    locale === "zh"
      ? {
          inputPlaceholder: "Minimal, Inter, etc.",
          done: "完成",
          openSearch: "打开搜索",
          hint: "按 F 打开",
          noData: "当前维度暂无可用筛选项",
          loading: "正在加载筛选项...",
          shortcuts: "F",
        }
      : {
          inputPlaceholder: "Minimal, Inter, etc.",
          done: "Done",
          openSearch: "Open search",
          hint: "Press F",
          noData: "No filters available",
          loading: "Loading filters...",
          shortcuts: "F",
        }

  const currentTabItems = facets[activeTab] || []
  const quickChips = useMemo(() => currentTabItems.slice(0, 6), [currentTabItems])

  useEffect(() => {
    if (!enabled || !open) return

    setQuery(searchParams.get("search")?.trim() || "")
    setSelectedFacets({
      types: toSlugList(searchParams.get("types")),
      styles: toSlugList(searchParams.get("styles")),
      frameworks: toSlugList(searchParams.get("frameworks")),
      fonts: toSlugList(searchParams.get("fonts")),
      platforms: toSlugList(searchParams.get("platforms")),
    })
  }, [enabled, open, searchParams])

  useEffect(() => {
    if (!enabled || !open || facetsLoaded || loadingFacets) return

    let cancelled = false

    const load = async () => {
      setLoadingFacets(true)
      try {
        const response = await fetch("/api/search-facets")
        if (!response.ok) return
        const data = await response.json()
        const payload = data?.facets
        if (!payload || cancelled) return

        setFacets({
          types: normalizeFacetItems(payload.types),
          styles: normalizeFacetItems(payload.styles),
          frameworks: normalizeFacetItems(payload.frameworks),
          fonts: normalizeFacetItems(payload.fonts),
          platforms: normalizeFacetItems(payload.platforms),
        })
        setFacetsLoaded(true)
      } catch {
        // ignore
      } finally {
        if (!cancelled) {
          setLoadingFacets(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [enabled, open, facetsLoaded, loadingFacets])

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false)
        return
      }

      if (event.key.toLowerCase() !== "f") return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement | null
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return

      event.preventDefault()
      setOpen(true)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enabled, open])

  useEffect(() => {
    if (!open) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [open])

  if (!enabled) {
    return null
  }

  const toggleFacet = (tab: TabId, slug: string) => {
    setSelectedFacets((current) => {
      const currentValues = current[tab]
      if (currentValues.includes(slug)) {
        return {
          ...current,
          [tab]: currentValues.filter((item) => item !== slug),
        }
      }
      return {
        ...current,
        [tab]: [...currentValues, slug],
      }
    })
  }

  const applyFilters = () => {
    const nextParams = new URLSearchParams(searchParams.toString())
    const nextQuery = query.trim()

    if (nextQuery) {
      nextParams.set("search", nextQuery)
    } else {
      nextParams.delete("search")
    }

    if (selectedFacets.types.length > 0) nextParams.set("types", selectedFacets.types.join(","))
    else nextParams.delete("types")

    if (selectedFacets.styles.length > 0) nextParams.set("styles", selectedFacets.styles.join(","))
    else nextParams.delete("styles")

    if (selectedFacets.frameworks.length > 0) nextParams.set("frameworks", selectedFacets.frameworks.join(","))
    else nextParams.delete("frameworks")

    if (selectedFacets.fonts.length > 0) nextParams.set("fonts", selectedFacets.fonts.join(","))
    else nextParams.delete("fonts")

    if (selectedFacets.platforms.length > 0) nextParams.set("platforms", selectedFacets.platforms.join(","))
    else nextParams.delete("platforms")

    const queryString = nextParams.toString()
    const target = queryString ? `/explore?${queryString}` : "/explore"
    router.push(target)
    setOpen(false)
  }

  return (
    <div data-quick-search-dock>
      <Button variant="unstyled"
        type="button"
        onClick={() => setOpen(true)}
        aria-label={copy.openSearch}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-50 flex h-[64px] w-[122px] -translate-x-1/2 items-center justify-between rounded-[32px] border border-[rgba(255,255,255,0.32)] bg-[rgba(153,153,153,0.78)] px-4 shadow-[0px_16px_40px_rgba(15,15,23,0.24)] backdrop-blur-xl transition duration-200 hover:scale-[1.02] hover:bg-[rgba(138,138,138,0.86)]"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.08)]">
          <span className="flex flex-col gap-1">
            <span className="h-[2px] w-5 rounded-full bg-[rgba(255,255,255,0.95)]" />
            <span className="h-[2px] w-4 rounded-full bg-[rgba(255,255,255,0.9)]" />
            <span className="h-[2px] w-2.5 rounded-full bg-[rgba(255,255,255,0.85)]" />
          </span>
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.08)] text-[20px] font-medium leading-none text-white">
          {copy.shortcuts}
        </span>
      </Button>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(15,15,23,0.45)] px-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-[460px] rounded-[28px] border border-[rgba(255,255,255,0.12)] bg-[rgba(36,36,40,0.88)] p-3 shadow-[0px_40px_120px_rgba(0,0,0,0.5)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Button variant="unstyled"
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.9)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.08)] px-3 py-2">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[rgba(255,255,255,0.65)]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      applyFilters()
                    }
                  }}
                  placeholder={copy.inputPlaceholder}
                  className="h-8 w-full bg-transparent text-[15px] text-[rgba(255,255,255,0.95)] outline-none placeholder:text-[rgba(255,255,255,0.45)]"
                  autoFocus
                />
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {quickChips.map((chip) => {
                const active = selectedFacets[activeTab].includes(chip.slug)
                return (
                  <Button variant="unstyled"
                    key={chip.id}
                    type="button"
                    onClick={() => toggleFacet(activeTab, chip.slug)}
                    className={`shrink-0 rounded-full border px-3 py-1 text-[13px] transition ${
                      active
                        ? "border-[rgba(255,255,255,0.5)] bg-[rgba(255,255,255,0.22)] text-white"
                        : "border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.88)]"
                    }`}
                  >
                    {chip.name}
                  </Button>
                )
              })}
            </div>

            <div className="mt-3 flex items-center gap-1 border-b border-[rgba(255,255,255,0.16)] px-1 pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <Button variant="unstyled"
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative inline-flex items-center gap-1 rounded-full px-2 py-1 text-[13px] transition ${
                      active ? "text-white" : "text-[rgba(255,255,255,0.55)]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {active ? (
                      <span className="absolute -bottom-[9px] left-2 right-2 h-[2px] rounded-full bg-[rgba(255,255,255,0.9)]" />
                    ) : null}
                  </Button>
                )
              })}
            </div>

            <div className="mt-2 h-[280px] overflow-y-auto pr-1">
              {loadingFacets ? (
                <div className="flex h-full items-center justify-center text-sm text-[rgba(255,255,255,0.58)]">
                  {copy.loading}
                </div>
              ) : currentTabItems.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-[rgba(255,255,255,0.58)]">
                  {copy.noData}
                </div>
              ) : (
                <ul className="space-y-1 py-2">
                  {currentTabItems.map((item) => {
                    const active = selectedFacets[activeTab].includes(item.slug)
                    return (
                      <li key={item.id}>
                        <Button variant="unstyled"
                          type="button"
                          onClick={() => toggleFacet(activeTab, item.slug)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                            active
                              ? "bg-[rgba(255,255,255,0.18)] text-white"
                              : "text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.08)]"
                          }`}
                        >
                          <span className="text-base leading-none">•</span>
                          <span className="ml-2 flex-1 text-[15px] font-medium leading-none">{item.name}</span>
                          <span className="text-sm text-[rgba(255,255,255,0.55)]">{item.designCount}</span>
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="mt-3 flex justify-end">
              <Button variant="unstyled"
                type="button"
                onClick={applyFilters}
                className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-[#26282e] shadow-[0px_4px_24px_rgba(255,255,255,0.25)]"
              >
                {copy.done}
              </Button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-[rgba(255,255,255,0.45)]">{copy.hint}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

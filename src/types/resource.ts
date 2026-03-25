import type { DesignDetail, DesignSummary } from "@/types/design"

export type ResourceSummary = DesignSummary & {
  resourceType: string
  toolAgent?: string | null
  scenario?: string | null
}

export type ResourceDetail = DesignDetail & {
  resourceType: string
  toolAgent?: string | null
  scenario?: string | null
}

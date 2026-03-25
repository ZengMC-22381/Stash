import { slugify } from "@/lib/slug"

export type ResourceDictionaryOption = {
  value: string
  label: string
}

export type ResourceDictionary = {
  resourceTypes: ResourceDictionaryOption[]
  tools: ResourceDictionaryOption[]
  tags: ResourceDictionaryOption[]
  scenarios: ResourceDictionaryOption[]
}

export const RESOURCE_TYPE_OPTIONS: ResourceDictionaryOption[] = [
  { value: "design-md", label: "DESIGN.md" },
  { value: "agent-skill", label: "Agent Skill" },
  { value: "prompt-pack", label: "Prompt / Prompt Pack" },
  { value: "workflow", label: "Workflow" },
  { value: "case-study", label: "Case Study" },
]

const RESOURCE_TOOL_LABELS = [
  "Stitch",
  "Figma / Figma Make",
  "v0",
  "Claude Code",
  "Codex",
  "Replit",
  "Lovable",
  "Cursor",
  "Framer",
  "Webflow",
  "Midjourney",
  "ChatGPT",
  "Gemini",
  "Dify",
  "Make",
  "Notion",
]

const RESOURCE_TAG_LABELS = [
  "Minimal",
  "Editorial",
  "Clean SaaS",
  "Premium",
  "Soft Gradient",
  "Bento UI",
  "Glassmorphism",
  "Playful",
  "Bold Typography",
  "Monochrome",
  "Dark Mode",
  "Apple-like",
  "Futuristic",
  "Enterprise Clean",
  "Creative Portfolio",
]

const RESOURCE_SCENARIO_LABELS = [
  "AI Product",
  "Dashboard",
  "Developer Tool",
  "Productivity",
  "SaaS",
  "E-commerce",
  "Marketplace",
  "Portfolio",
  "Mobile App",
  "Landing Page",
  "Education",
  "Finance",
  "Healthcare",
  "Enterprise",
  "Consumer App",
  "Creator Economy",
  "Media",
  "Social",
  "Gaming",
]

function toOptions(labels: string[]): ResourceDictionaryOption[] {
  return labels.map((label) => ({
    value: slugify(label),
    label,
  }))
}

export const RESOURCE_TOOL_OPTIONS = toOptions(RESOURCE_TOOL_LABELS)
export const RESOURCE_TAG_OPTIONS = toOptions(RESOURCE_TAG_LABELS)
export const RESOURCE_SCENARIO_OPTIONS = toOptions(RESOURCE_SCENARIO_LABELS)

export const RESOURCE_DICTIONARY: ResourceDictionary = {
  resourceTypes: RESOURCE_TYPE_OPTIONS,
  tools: RESOURCE_TOOL_OPTIONS,
  tags: RESOURCE_TAG_OPTIONS,
  scenarios: RESOURCE_SCENARIO_OPTIONS,
}

export const DEFAULT_RESOURCE_TYPE = RESOURCE_TYPE_OPTIONS[0].value

function normalizeToken(input: string) {
  return input.trim().toLowerCase()
}

export function resolveDictionaryOption(
  input: unknown,
  options: ResourceDictionaryOption[]
): ResourceDictionaryOption | null {
  if (typeof input !== "string") return null
  const normalized = normalizeToken(input)
  if (!normalized) return null

  return (
    options.find(
      (option) =>
        normalizeToken(option.value) === normalized || normalizeToken(option.label) === normalized
    ) || null
  )
}

export function normalizeResourceTagValues(input: unknown): string[] {
  const source =
    Array.isArray(input)
      ? input.map((item) => String(item))
      : typeof input === "string"
        ? input.split(",")
        : []

  const normalized = Array.from(
    new Set(
      source
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )

  return normalized
    .map((item) => resolveDictionaryOption(item, RESOURCE_TAG_OPTIONS)?.label || item)
    .filter(Boolean)
}

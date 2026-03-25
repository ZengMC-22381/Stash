export const LOCALE_COOKIE_NAME = "stash_locale"
export const DEFAULT_LOCALE = "zh"

export const SUPPORTED_LOCALES = ["zh", "en"] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export function normalizeLocale(input?: string | null): Locale {
  return input === "en" ? "en" : "zh"
}

type TopicTranslation = {
  title: string
  description: string
}

const topicTranslations: Record<string, Record<Locale, TopicTranslation>> = {
  saas: {
    zh: {
      title: "SaaS",
      description: "面向订阅制产品的高质感界面模板。",
    },
    en: {
      title: "SaaS",
      description: "Polished interface kits for subscription products.",
    },
  },
  dashboard: {
    zh: {
      title: "数据仪表盘",
      description: "强调层级与可读性的数据可视化方案。",
    },
    en: {
      title: "Dashboard",
      description: "Clarity-first templates for complex data views.",
    },
  },
  "landing-page": {
    zh: {
      title: "落地页",
      description: "兼顾品牌表达与转化效率的叙事布局。",
    },
    en: {
      title: "Landing Page",
      description: "Story-driven layouts with strong conversion focus.",
    },
  },
  "mobile-app": {
    zh: {
      title: "移动应用",
      description: "紧凑信息密度下依旧顺滑的移动端体验。",
    },
    en: {
      title: "Mobile App",
      description: "Compact mobile patterns with smooth interactions.",
    },
  },
  "e-commerce": {
    zh: {
      title: "电商",
      description: "围绕商品展示与下单转化优化的流程模板。",
    },
    en: {
      title: "E-commerce",
      description: "Conversion-ready commerce flows and storefront UI.",
    },
  },
  "game-ui": {
    zh: {
      title: "游戏 UI",
      description: "更具沉浸感与趣味性的 HUD 与菜单设计。",
    },
    en: {
      title: "Game UI",
      description: "Immersive HUD and menu systems with playful polish.",
    },
  },
  "ai-tool": {
    zh: {
      title: "AI 工具",
      description: "适配 AI 场景的人机协作界面范式。",
    },
    en: {
      title: "AI Tool",
      description: "Human-AI workflow interfaces for next-gen tools.",
    },
  },
}

export function localizeTopic(
  slug: string,
  locale: Locale,
  fallbackName: string,
  fallbackDescription?: string | null
): TopicTranslation {
  const translated = topicTranslations[slug]?.[locale]
  if (translated) {
    return translated
  }

  return {
    title: fallbackName,
    description: fallbackDescription || "",
  }
}

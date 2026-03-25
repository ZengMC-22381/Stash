import type { Locale } from "@/lib/locale"
import type { ResourceSummary } from "@/types/resource"
import DesignCard from "@/components/design-card"

type Props = {
  resource: ResourceSummary
  locale?: Locale
}

export default function ResourceCard({ resource, locale = "zh" }: Props) {
  return <DesignCard design={resource} locale={locale} />
}

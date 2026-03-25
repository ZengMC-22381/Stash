import type { Locale } from "@/lib/locale"
import DesignEngagement from "@/components/design-engagement"

type Props = {
  slug: string
  locale: Locale
}

export default function ResourceEngagement({ slug, locale }: Props) {
  return <DesignEngagement slug={slug} locale={locale} />
}

import DesignDetailPage from "@/app/designs/[slug]/page"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default function LegacyDesignPage(props: PageProps) {
  return <DesignDetailPage {...props} />
}

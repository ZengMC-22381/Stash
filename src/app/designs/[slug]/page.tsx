import ResourceDetailPage from "@/app/resources/[slug]/page"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default function LegacyDesignsPage(props: PageProps) {
  return <ResourceDetailPage {...props} />
}

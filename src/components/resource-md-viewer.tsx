import DesignMdViewer from "@/components/design-md-viewer"

type Props = {
  content: string
}

export default function ResourceMdViewer({ content }: Props) {
  return <DesignMdViewer content={content} />
}

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import ResourceActions from "@/components/resource-actions"
import ResourceMdViewer from "@/components/resource-md-viewer"
import ResourcePreviewPager from "@/components/resource-preview-pager"
import { getResourceDetail } from "@/lib/data"
import { getServerLocale } from "@/lib/server-locale"

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const locale = await getServerLocale()
  const { slug } = await params
  const resource = await getResourceDetail(slug)
  if (!resource) {
    notFound()
  }

  const copy =
    locale === "zh"
      ? {
          back: "返回",
          docTag: "DESIGN.md",
          updated: "更新于",
          markdown: "Markdown 预览",
        }
      : {
          back: "Back",
          docTag: "DESIGN.md",
          updated: "Updated",
          markdown: "Markdown Preview",
        }

  const authorInitial = resource.author.name?.trim()?.charAt(0)?.toUpperCase() || "G"
  const dateLabel = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(resource.updatedAt))

  return (
    <div className="bg-[#f9f9f9]">
      <section className="mx-auto w-full max-w-[1280px]">
        <div className="grid border-x border-[rgba(39,39,42,0.18)] lg:min-h-[calc(100vh-65px)] lg:grid-cols-[640px_minmax(0,1fr)]">
          <section className="flex flex-col border-b border-[rgba(39,39,42,0.18)] lg:border-b-0 lg:border-r lg:border-[rgba(39,39,42,0.3)]">
            <div className="px-6 py-6 sm:px-10 lg:px-12 lg:py-7">
              <div className="flex items-center gap-3 text-xs tracking-[0.1em] text-[#71717a]">
                <Link href="/explore" className="inline-flex items-center gap-1.5 font-semibold uppercase">
                  <ArrowLeft className="h-3 w-3" />
                  {copy.back}
                </Link>
                <span className="h-1 w-1 rounded-full bg-[#3f3f46]" />
                <span className="font-semibold text-black">{copy.docTag}</span>
              </div>

              <h1 className="mt-4 max-w-[420px] text-[46px] font-extrabold leading-[0.96] tracking-[-0.04em] text-[#333333]">
                {resource.title}
              </h1>
              <p className="mt-4 max-w-[520px] text-[22px] leading-[1.45] text-[#71717a]">{resource.description}</p>

              <div className="mt-7 border-t border-[rgba(209,209,209,1)] pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#f3f4f4] bg-gradient-to-br from-[#6C47FF] via-[#9D7BFF] to-[#FF6B97] text-xs font-semibold text-white">
                      {authorInitial}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#333333]">{resource.author.name}</p>
                      <p className="text-xs text-[#52525b]">
                        {copy.updated} {dateLabel}
                      </p>
                    </div>
                  </div>

                  <ResourceActions slug={resource.slug} locale={locale} />
                </div>
              </div>
            </div>

            <div className="flex min-h-[360px] flex-1 flex-col bg-black">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-6 py-4 text-[#b2b2b2] sm:px-10 lg:px-12">
                <span className="text-[15px] font-medium">{copy.docTag}</span>
                <span className="text-xs uppercase tracking-[0.12em] text-[#6b7280]">{copy.markdown}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-10 lg:px-12">
                <ResourceMdViewer content={resource.content} />
              </div>
            </div>
          </section>

          <ResourcePreviewPager images={resource.images} title={resource.title} locale={locale} />
        </div>
      </section>
    </div>
  )
}

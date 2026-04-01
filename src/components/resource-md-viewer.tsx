/* eslint-disable @next/next/no-img-element */
import { FileText, Link2 } from "lucide-react"
import DesignMdViewer from "@/components/design-md-viewer"
import type { DesignContentBlock } from "@/types/design"

type Props = {
  blocks: DesignContentBlock[]
  locale: "zh" | "en"
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

export default function ResourceMdViewer({ blocks, locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          markdown: "Markdown 内容",
          link: "链接块",
          file: "文件块",
          fileSize: "文件大小",
          openLink: "打开链接",
          openFile: "下载文件",
          noBlocks: "暂无可展示内容块。",
        }
      : {
          markdown: "Markdown",
          link: "Link",
          file: "File",
          fileSize: "File size",
          openLink: "Open link",
          openFile: "Download file",
          noBlocks: "No content blocks available.",
        }

  if (blocks.length === 0) {
    return <p className="text-sm text-slate-400">{copy.noBlocks}</p>
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => {
        if (block.type === "markdown") {
          return (
            <section key={`${block.type}-${index}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                <FileText className="h-3.5 w-3.5" />
                {copy.markdown}
              </div>
              <DesignMdViewer content={block.markdown} />
            </section>
          )
        }

        if (block.type === "link") {
          const preview = block.previewImageUrl
          return (
            <section key={`${block.type}-${index}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                <Link2 className="h-3.5 w-3.5" />
                {copy.link}
              </div>
              <a
                href={block.url}
                target="_blank"
                rel="noreferrer"
                className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06]"
              >
                <div className="h-16 w-16 overflow-hidden rounded-md bg-slate-700/40">
                  {preview ? <img src={preview} alt={block.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-100">{block.title}</p>
                  <p className="truncate text-xs text-slate-400">{block.url}</p>
                  <p className="mt-2 text-xs text-indigo-300">{copy.openLink}</p>
                </div>
              </a>
            </section>
          )
        }

        return (
          <section key={`${block.type}-${index}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              <FileText className="h-3.5 w-3.5" />
              {copy.file}
            </div>
            <a
              href={block.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06]"
            >
              <p className="truncate text-sm font-semibold text-slate-100">{block.fileName}</p>
              <p className="mt-1 text-xs text-slate-400">
                {copy.fileSize}: {formatBytes(block.fileSizeBytes)}
              </p>
              <p className="mt-2 text-xs text-indigo-300">{copy.openFile}</p>
            </a>
          </section>
        )
      })}
    </div>
  )
}

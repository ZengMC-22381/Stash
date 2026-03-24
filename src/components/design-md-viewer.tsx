import React from "react"

const headingOne = "text-[#818CF8] font-semibold"
const headingTwo = "text-slate-300 font-semibold"
const listItem = "text-[#6EE7B7]"
const defaultText = "text-slate-200"

export default function DesignMdViewer({ content }: { content: string }) {
  const lines = content.split("\n")

  return (
    <div className="space-y-1 font-mono text-sm leading-relaxed">
      {lines.map((line, index) => {
        if (!line.trim()) {
          return <div key={`space-${index}`} className="h-4" />
        }

        if (line.startsWith("# ")) {
          return (
            <div key={index} className={headingOne}>
              {line.replace(/^#\s*/, "")}
            </div>
          )
        }

        if (line.startsWith("## ")) {
          return (
            <div key={index} className={headingTwo}>
              {line.replace(/^##\s*/, "")}
            </div>
          )
        }

        if (line.startsWith("### ")) {
          return (
            <div key={index} className={headingTwo}>
              {line.replace(/^###\s*/, "")}
            </div>
          )
        }

        if (line.startsWith("- ")) {
          return (
            <div key={index} className={listItem}>
              {line}
            </div>
          )
        }

        return (
          <div key={index} className={defaultText}>
            {line}
          </div>
        )
      })}
    </div>
  )
}

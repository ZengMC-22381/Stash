import type { Metadata } from "next"
import { JetBrains_Mono, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google"
import "@/app/globals.css"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import QuickSearchDock from "@/components/quick-search-dock"
import { getServerLocale } from "@/lib/server-locale"

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale()
  if (locale === "zh") {
    return {
      title: "ClawHub · DESIGN.md 中文社区",
      description: "发现、发布与 Remix DESIGN.md，并查看对应的真实界面效果图。",
    }
  }

  return {
    title: "ClawHub · DESIGN.md Community",
    description: "Discover, share, and remix DESIGN.md prompts with matching UI outputs.",
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getServerLocale()

  return (
    <html lang={locale} className={`${plusJakarta.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <head>
        <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />
      </head>
      <body className="font-sans">
        <div className="min-h-screen bg-white text-slate-900">
          <SiteHeader locale={locale} />
          <main className="pt-[65px]">{children}</main>
          <SiteFooter locale={locale} />
          <QuickSearchDock locale={locale} />
        </div>
      </body>
    </html>
  )
}

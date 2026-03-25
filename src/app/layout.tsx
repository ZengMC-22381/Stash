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
      title: "Stash · 资源创作者社区",
      description: "发现、发布与 Remix 资源，并查看对应的真实效果图。",
    }
  }

  return {
    title: "Stash · Resource Creator Community",
    description: "Discover, publish, and remix resources with matching real-world outputs.",
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

/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Locale } from "@/lib/locale"

type Props = {
  locale: Locale
}

const iconDiscord = "https://www.figma.com/api/mcp/asset/4e48676d-63ca-41af-8b79-f63f362c561a"
const iconX = "https://www.figma.com/api/mcp/asset/ea13bdbc-a11b-402f-ac4f-54340f2c6d6d"
const iconXiaohongshu = "https://www.figma.com/api/mcp/asset/44f65b2a-433d-4851-9a10-629fc357601f"

export default function SiteFooter({ locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          linksTitle: "友情链接",
          links: ["Friendly links1", "Friendly links2", "Friendly links3"],
          aboutTitle: "关于本站",
          about: [
            { label: "介绍", href: "/" },
            { label: "博客", href: "/forum" },
            { label: "隐私政策", href: "/" },
          ],
          newsletterTitle: "AI时代的设计社区",
          newsletterDesc: "订阅最新的AI设计技巧",
          subscribe: "Subscribe",
          emailPlaceholder: "email@example.com",
          brandDesc: "分享真正可直接使用的、AI时代的设计技巧。",
          stayInTouch: "Stay in touch",
          rights: "© 2024 Stash.",
        }
      : {
          linksTitle: "Friendly Links",
          links: ["Friendly links1", "Friendly links2", "Friendly links3"],
          aboutTitle: "About",
          about: [
            { label: "About", href: "/" },
            { label: "Blog", href: "/forum" },
            { label: "Privacy", href: "/" },
          ],
          newsletterTitle: "Design Community in the AI Era",
          newsletterDesc: "Subscribe for the latest AI design techniques",
          subscribe: "Subscribe",
          emailPlaceholder: "email@example.com",
          brandDesc: "Share practical, ready-to-use design techniques for the AI era.",
          stayInTouch: "Stay in touch",
          rights: "© 2024 Stash.",
        }

  return (
    <footer data-site-footer className="border-t border-[#d1d1d1] bg-[#f9f9f9] px-4 lg:px-12">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 py-6 lg:flex-row">
        <section className="order-2 w-full rounded-[40px] bg-[linear-gradient(139.677deg,#081F4E_2.18%,#1D489B_39.58%,#6B9BD6_97.88%)] p-10 text-white lg:order-2 lg:h-[400px] lg:w-[400px]">
          <div>
            <p className="font-display text-[36px] font-semibold leading-[40px] tracking-[-1.8px]">Stash</p>
            <p className="mt-3 max-w-[280px] text-[14px] leading-7 text-[#b2b2b2]">{copy.brandDesc}</p>
          </div>

          <div className="mt-16 space-y-3 lg:mt-[150px]">
            <div className="flex items-center justify-end gap-4">
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e293b]"
                aria-label="Discord"
              >
                <img src={iconDiscord} alt="" className="h-5 w-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e293b]"
                aria-label="X"
              >
                <img src={iconX} alt="" className="h-5 w-5" />
              </a>
              <a
                href="https://www.xiaohongshu.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e293b]"
                aria-label="Xiaohongshu"
              >
                <img src={iconXiaohongshu} alt="" className="h-6 w-6" />
              </a>
              <span className="font-stay-in-touch flex-1 text-right text-[30px] leading-[1]">{copy.stayInTouch}</span>
            </div>
            <p className="text-[12px] leading-4">{copy.rights}</p>
          </div>
        </section>

        <section className="order-1 flex-1 rounded-[48px] bg-[#f2f2f2] px-6 py-9 lg:order-1 lg:h-[400px] lg:px-6 lg:py-9">
          <div className="mx-auto flex w-full max-w-[704px] flex-col">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#2f3334]">{copy.linksTitle}</p>
                <div className="mt-4 space-y-[15px]">
                  {copy.links.map((label) => (
                    <a key={label} href="/" className="block text-[14px] leading-[22.75px] text-[#64748b]">
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[1px] text-[#2f3334]">{copy.aboutTitle}</p>
                <div className="mt-4 space-y-[15px]">
                  {copy.about.map((item) => (
                    <Link key={item.label} href={item.href} className="block text-[14px] leading-[22.75px] text-[#64748b]">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-[32px] px-0 py-0">
              <p className="text-[30px] font-semibold leading-[37.5px] text-[#2f3334]">{copy.newsletterTitle}</p>
              <p className="mt-2 text-[14px] leading-[22.75px] text-[#5c6060]">{copy.newsletterDesc}</p>

              <form className="mt-3 flex w-full max-w-[448px] items-center rounded-[16px] border border-[rgba(175,178,179,0.2)] bg-white p-[9px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                <Input
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  className="h-[39px] w-full rounded-[12px] border-0 px-4 text-[14px] text-[#6b7280] outline-none"
                />
                <Button variant="unstyled"
                  type="button"
                  className="ml-2 rounded-[12px] bg-[#333333] px-6 py-2 text-[14px] font-semibold text-white"
                >
                  {copy.subscribe}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </footer>
  )
}

"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Locale } from "@/lib/locale"

type Props = {
  locale: Locale
  initialMode: "login" | "register"
}

type Mode = "login" | "register"

const loginHeroImageUrl = "https://www.figma.com/api/mcp/asset/8df59ead-c4cc-4f29-931c-ae3b9923ac7a"
const registerHeroImageUrl = "https://www.figma.com/api/mcp/asset/1921d494-8cc4-4806-bff5-a9a4f0b70eac"
const googleIconUrl = "https://www.figma.com/api/mcp/asset/2d847070-b2fd-4286-9bde-2b51eec6667f"
const loginEmailIconUrl = "https://www.figma.com/api/mcp/asset/5488c894-85eb-4194-9320-fbd1c1d4e31b"
const loginPasswordIconUrl = "https://www.figma.com/api/mcp/asset/f439fd58-8354-417b-91cc-10bc8b298de8"
const registerEmailIconUrl = "https://www.figma.com/api/mcp/asset/8a493f85-c6b9-48e3-be05-eaf69c2b2a74"
const registerPasswordIconUrl = "https://www.figma.com/api/mcp/asset/447792bf-414f-492c-b1aa-fa8973dc512b"

function normalizeNextPath(raw: string | null) {
  if (!raw) return "/explore"
  if (!raw.startsWith("/")) return "/explore"
  if (raw.startsWith("//")) return "/explore"
  if (raw.startsWith("/api/")) return "/explore"
  return raw
}

function deriveNameFromEmail(email: string) {
  const localPart = email.split("@")[0]?.trim() || ""
  const normalized = localPart.replace(/[._-]+/g, " ").trim()
  if (!normalized) return "Creator"
  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function LoginPageClient({ locale, initialMode }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [providerHint, setProviderHint] = useState<string | null>(null)

  const nextPath = useMemo(() => normalizeNextPath(searchParams.get("next")), [searchParams])
  const heroImageUrl = mode === "login" ? loginHeroImageUrl : registerHeroImageUrl
  const emailIconUrl = mode === "login" ? loginEmailIconUrl : registerEmailIconUrl
  const passwordIconUrl = mode === "login" ? loginPasswordIconUrl : registerPasswordIconUrl

  const copy =
    locale === "zh"
      ? {
          titleLogin: "登录",
          titleRegister: "注册",
          thirdParty: "第三方登录",
          emailLogin: "邮箱登录",
          emailPlaceholder: "请输入邮箱",
          passwordPlaceholder: "请输入密码",
          setPasswordPlaceholder: "请设置密码",
          confirmPasswordPlaceholder: "请确认密码",
          submitLogin: "开始探索",
          submitRegister: "注册",
          noAccount: "还没有账号？",
          toRegister: "前往注册",
          hasAccount: "已有账号？",
          toLogin: "前往登录",
          invalidEmail: "请输入有效邮箱地址。",
          invalidPassword: "密码长度至少 8 位。",
          passwordNotMatch: "两次输入的密码不一致。",
          requestFailed: "请求失败，请稍后重试。",
          googleSoon: "Google 登录即将支持。",
        }
      : {
          titleLogin: "Sign in",
          titleRegister: "Create account",
          thirdParty: "Third-party sign in",
          emailLogin: "Email sign in",
          emailPlaceholder: "Enter your email",
          passwordPlaceholder: "Enter your password",
          setPasswordPlaceholder: "Set your password",
          confirmPasswordPlaceholder: "Confirm your password",
          submitLogin: "Start Exploring",
          submitRegister: "Register",
          noAccount: "No account yet?",
          toRegister: "Create one",
          hasAccount: "Already have an account?",
          toLogin: "Sign in",
          invalidEmail: "Please enter a valid email address.",
          invalidPassword: "Password must be at least 8 characters.",
          passwordNotMatch: "Passwords do not match.",
          requestFailed: "Request failed. Please try again.",
          googleSoon: "Google sign-in is coming soon.",
        }

  const setModeAndSyncUrl = (nextMode: Mode) => {
    setMode(nextMode)
    setError(null)
    setProviderHint(null)
    setPassword("")
    setConfirmPassword("")

    const params = new URLSearchParams(searchParams.toString())
    if (nextMode === "register") {
      params.set("mode", "register")
    } else {
      params.delete("mode")
    }

    const query = params.toString()
    router.replace(query ? `/login?${query}` : "/login")
  }

  const handleGoogleClick = () => {
    setError(null)
    setProviderHint(copy.googleSoon)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setProviderHint(null)

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError(copy.invalidEmail)
      return
    }

    if (!password || password.length < 8) {
      setError(copy.invalidPassword)
      return
    }

    if (mode === "register" && password !== confirmPassword) {
      setError(copy.passwordNotMatch)
      return
    }

    setLoading(true)
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const payload =
        mode === "login"
          ? { email: normalizedEmail, password }
          : {
              name: deriveNameFromEmail(normalizedEmail),
              email: normalizedEmail,
              password,
            }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.error || copy.requestFailed)
        return
      }

      router.push(nextPath)
    } catch {
      setError(copy.requestFailed)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#f9f9f9]">
      <header className="fixed inset-x-0 top-0 z-20 border-b border-[rgba(228,228,231,0.8)] bg-[rgba(255,255,255,0.8)]">
        <div className="mx-auto flex h-[65px] w-full max-w-[1279px] items-center justify-center px-[63.5px]">
          <Link href="/" className="font-display text-[20px] font-bold leading-7 text-[#0f172a]">
            Stash
          </Link>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-65px)] w-full max-w-[1279px] items-start px-6 pb-8 pt-[89px] lg:items-center">
        <section className="flex w-full flex-col gap-4 lg:h-[735px] lg:flex-row lg:gap-3">
          <div className="relative min-h-[320px] flex-1 rounded-[24px] bg-[#eeede9] lg:min-h-0">
            <div className="absolute left-0 top-0 h-full w-full lg:hidden">
              <img src={heroImageUrl} alt="" className="h-full w-full object-cover object-center" />
            </div>
            <div className="pointer-events-none absolute left-[-59px] top-[2px] hidden h-[684px] w-[818px] lg:block">
              <img src={heroImageUrl} alt="" className="h-full w-full max-w-none object-cover" />
            </div>
          </div>

          <section className="flex flex-1 flex-col justify-center gap-9 px-1 py-2 lg:pl-24 lg:pr-32">
            <h1 className="text-[48px] font-semibold leading-[48px] text-[#333333]">
              {mode === "login" ? copy.titleLogin : copy.titleRegister}
            </h1>

            {mode === "login" ? (
              <div className="border-b border-[#d1d1d1] pb-6">
                <p className="text-[16px] leading-4 text-[#333333]">{copy.thirdParty}</p>
                <Button variant="unstyled"
                  type="button"
                  onClick={handleGoogleClick}
                  className="relative mt-4 h-[40px] w-[156px] overflow-hidden rounded-[12px] border border-[#d1d1d1] bg-white"
                >
                  <span className="absolute left-[-14px] top-[-17.5px] flex size-[72.419px] items-center justify-center">
                    <span className="block h-[57.653px] w-[57.653px] rotate-[-17.65deg]">
                      <img src={googleIconUrl} alt="" className="h-full w-full object-cover" />
                    </span>
                  </span>
                  <span className="absolute left-[66px] top-[11px] text-[16px] leading-4 text-[#333333]">Google</span>
                </Button>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[16px] leading-4 text-[#333333]">{copy.emailLogin}</p>

              <Label variant="unstyled" className="flex h-[40px] w-full items-center gap-4 overflow-hidden rounded-[12px] bg-[#f2f2f2] px-3">
                <img src={emailIconUrl} alt="" className="h-6 w-6 shrink-0" />
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="w-full border-0 bg-transparent text-[16px] leading-4 text-[#333333] outline-none placeholder:text-[#b2b2b2]"
                  autoComplete="email"
                />
              </Label>

              <Label variant="unstyled" className="flex h-[40px] w-full items-center gap-4 overflow-hidden rounded-[12px] bg-[#f2f2f2] px-3">
                <img src={passwordIconUrl} alt="" className="h-6 w-6 shrink-0" />
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={mode === "login" ? copy.passwordPlaceholder : copy.setPasswordPlaceholder}
                  className="w-full border-0 bg-transparent text-[16px] leading-4 text-[#333333] outline-none placeholder:text-[#b2b2b2]"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </Label>

              {mode === "register" ? (
                <Label variant="unstyled" className="flex h-[40px] w-full items-center gap-4 overflow-hidden rounded-[12px] bg-[#f2f2f2] px-3">
                  <img src={passwordIconUrl} alt="" className="h-6 w-6 shrink-0" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={copy.confirmPasswordPlaceholder}
                    className="w-full border-0 bg-transparent text-[16px] leading-4 text-[#333333] outline-none placeholder:text-[#b2b2b2]"
                    autoComplete="new-password"
                  />
                </Label>
              ) : null}

              <Button variant="unstyled"
                type="submit"
                disabled={loading}
                className="flex h-[40px] w-full items-center justify-center rounded-[12px] bg-[#333333] px-3 text-[16px] font-semibold leading-4 text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "..." : mode === "login" ? copy.submitLogin : copy.submitRegister}
              </Button>

              {error ? <p className="text-[14px] leading-5 text-[#dc2626]">{error}</p> : null}
              {providerHint ? <p className="text-[14px] leading-5 text-[#52525b]">{providerHint}</p> : null}
            </form>

            <p className="text-[16px] leading-4 text-[#333333]">
              {mode === "login" ? copy.noAccount : copy.hasAccount}{" "}
              <Button variant="unstyled"
                type="button"
                onClick={() => setModeAndSyncUrl(mode === "login" ? "register" : "login")}
                className="font-semibold"
              >
                {mode === "login" ? copy.toRegister : copy.toLogin}
              </Button>
            </p>
          </section>
        </section>
      </main>
    </div>
  )
}

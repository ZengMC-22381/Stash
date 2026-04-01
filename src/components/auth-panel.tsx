"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Locale } from "@/lib/locale"

type User = {
  id: string
  name: string
  email: string
  handle: string
  createdAt: string
}

type Props = {
  locale: Locale
}

export default function AuthPanel({ locale }: Props) {
  const copy =
    locale === "zh"
      ? {
          section: "账号",
          signedInAs: "当前已登录：",
          signInToPublish: "登录后即可投稿",
          createOrLogin: "创建账号或登录后即可发布资源内容。",
          logout: "退出登录",
          fullName: "姓名",
          handle: "用户名（可选）",
          email: "邮箱",
          password: "密码",
          pleaseWait: "请稍候",
          login: "登录",
          createAccount: "创建账号",
          needAccount: "还没有账号？",
          hasAccount: "已有账号？",
          requestFailed: "请求失败，请稍后重试。",
          welcomeBack: "欢迎回来。",
          created: "账号创建成功。",
        }
      : {
          section: "Account",
          signedInAs: "Signed in as ",
          signInToPublish: "Sign in to publish",
          createOrLogin: "Create an account or log in to publish resources.",
          logout: "Log out",
          fullName: "Full name",
          handle: "Handle (optional)",
          email: "Email",
          password: "Password",
          pleaseWait: "Please wait",
          login: "Log in",
          createAccount: "Create account",
          needAccount: "Need an account?",
          hasAccount: "Already have an account?",
          requestFailed: "Request failed.",
          welcomeBack: "Welcome back.",
          created: "Account created.",
        }

  const [user, setUser] = useState<User | null>(null)
  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    handle: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) return
        const data = await res.json()
        setUser(data.user)
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, handle: form.handle, email: form.email, password: form.password }

      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || copy.requestFailed)
        return
      }

      setUser(data.user)
      setMessage(mode === "login" ? copy.welcomeBack : copy.created)
    } catch {
      setMessage(copy.requestFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }

  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{copy.section}</p>
          <h2 className="mt-3 font-display text-2xl text-slate-900">
            {user ? `${copy.signedInAs}${user.name}` : copy.signInToPublish}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {user ? `@${user.handle}` : copy.createOrLogin}
          </p>
        </div>
        {user ? (
          <Button variant="unstyled"
            onClick={handleLogout}
            className="inline-flex h-11 items-center rounded-full border border-border bg-white px-5 text-sm font-semibold text-slate-700"
          >
            {copy.logout}
          </Button>
        ) : null}
      </div>

      {!user ? (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          {mode === "register" ? (
            <>
              <Input
                value={form.name}
                onChange={handleChange("name")}
                placeholder={copy.fullName}
                className="h-11 rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
              <Input
                value={form.handle}
                onChange={handleChange("handle")}
                placeholder={copy.handle}
                className="h-11 rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              />
            </>
          ) : null}
          <Input
            value={form.email}
            onChange={handleChange("email")}
            placeholder={copy.email}
            className="h-11 rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          <Input
            type="password"
            value={form.password}
            onChange={handleChange("password")}
            placeholder={copy.password}
            className="h-11 rounded-2xl border border-border px-4 text-sm text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button variant="unstyled"
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-float"
            >
              {loading ? copy.pleaseWait : mode === "login" ? copy.login : copy.createAccount}
            </Button>
            <Button variant="unstyled"
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm font-semibold text-slate-600"
            >
              {mode === "login" ? copy.needAccount : copy.hasAccount}
            </Button>
            {message ? <span className="text-sm text-slate-500">{message}</span> : null}
          </div>
        </form>
      ) : null}
    </div>
  )
}

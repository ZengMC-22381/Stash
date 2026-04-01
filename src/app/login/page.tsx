import LoginPageClient from "@/components/login-page-client"
import { getServerLocale } from "@/lib/server-locale"

type PageProps = {
  searchParams: Promise<{
    mode?: string
  }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const locale = await getServerLocale()
  const params = await searchParams
  const initialMode = params.mode === "register" ? "register" : "login"

  return <LoginPageClient locale={locale} initialMode={initialMode} />
}

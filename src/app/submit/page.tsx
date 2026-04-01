import SubmitForm from "@/components/submit-form"
import { getServerLocale } from "@/lib/server-locale"

export default async function SubmitPage() {
  const locale = await getServerLocale()

  return (
    <div className="h-[calc(100vh-65px)] overflow-hidden">
      <section className="mx-auto h-full w-full max-w-[1279px]">
        <SubmitForm locale={locale} />
      </section>
    </div>
  )
}

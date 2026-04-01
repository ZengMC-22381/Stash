export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        [data-site-header],
        [data-quick-search-dock] {
          display: none !important;
        }

        [data-app-main] {
          padding-top: 0 !important;
        }
      `}</style>
      {children}
    </>
  )
}

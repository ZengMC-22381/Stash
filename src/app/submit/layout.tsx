export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`
        [data-site-footer],
        [data-quick-search-dock] {
          display: none !important;
        }

        [data-app-main] {
          height: 100vh;
          overflow: hidden;
        }

        @media (max-width: 1023px) {
          [data-app-main] {
            height: auto;
            overflow: visible;
          }
        }
      `}</style>
      {children}
    </>
  )
}

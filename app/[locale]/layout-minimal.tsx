export default async function MinimalLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <html lang={locale}>
      <body>
        <div>Minimal Layout - Locale: {locale}</div>
        {children}
      </body>
    </html>
  )
}
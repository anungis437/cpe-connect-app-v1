import HomePageContentFr from '@/components/homepage-fr'

export default function FrenchHomePage() {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <HomePageContentFr />
      </body>
    </html>
  )
}
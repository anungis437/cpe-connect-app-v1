import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { cn } from '@/lib/design-system/utils'
import { ThemeProvider, ThemeScript } from '@/components/ui'

const locales = ['en', 'fr']

// Design system fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return {
    title: 'CPE Academy - LMS',
    description: 'Bilingual Self-Paced Learning Management System',
    other: {
      lang: locale,
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate locale
  if (!locales.includes(locale)) {
    notFound()
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(inter.variable, jetbrainsMono.variable, 'min-h-screen bg-background font-sans antialiased')}>
        <ThemeScript />
        <ThemeProvider
          defaultTheme="light"
          enableSystem
          attribute="data-theme"
          storageKey="cpe-connect-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

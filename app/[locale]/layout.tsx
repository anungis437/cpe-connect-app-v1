import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { cn } from '@/lib/design-system/utils'
import { ThemeProvider, ThemeScript } from '@/components/ui'
import enMessages from '../../messages/en.json'
import frMessages from '../../messages/fr.json'

const locales = ['en', 'fr']

const messages = {
  en: enMessages,
  fr: frMessages,
} as const

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

interface LocaleLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Validate locale
  if (!locales.includes(locale)) {
    notFound()
  }

  // Get messages for the locale
  const localeMessages = messages[locale as keyof typeof messages] || messages.en

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(inter.variable, jetbrainsMono.variable, 'min-h-screen bg-background font-sans antialiased')}>
        <ThemeScript storageKey="cpe-connect-theme" />
        <NextIntlClientProvider locale={locale} messages={localeMessages}>
          <ThemeProvider
            defaultTheme="light"
            enableSystem
            attribute="data-theme"
            storageKey="cpe-connect-theme"
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

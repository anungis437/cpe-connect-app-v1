import type { Metadata } from 'next'
import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { cn } from '@/lib/design-system/utils'
import { ThemeProvider, ThemeScript } from '@/components/ui'

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

export const metadata: Metadata = {
  title: 'CPE Academy - LMS',
  description: 'Bilingual Self-Paced Learning Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(inter.variable, jetbrainsMono.variable, 'antialiased')} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background font-sans">
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

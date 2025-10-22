import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PublicHeader from '@/components/navigation/public-header'
import PublicFooter from '@/components/navigation/public-footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CPE Connect - Plateforme de Formation Professionnelle',
  description: 'Plateforme de développement professionnel continu pour les secteurs de la santé et services sociaux au Québec',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <PublicHeader />
          <main className="flex-1">
            {children}
          </main>
          <PublicFooter />
        </div>
      </body>
    </html>
  )
}

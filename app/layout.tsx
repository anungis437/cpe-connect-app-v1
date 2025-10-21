import type { Metadata } from 'next'
import './globals.css'
import { Poppins } from 'next/font/google'
import { cn } from '@/lib/utils/index'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
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
    <html lang="en" className={cn(poppins.variable, 'antialiased')}>
      <body className="min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  )
}

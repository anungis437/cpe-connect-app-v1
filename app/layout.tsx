import * as Sentry from '@sentry/nextjs'
import type { Metadata } from 'next'
import './globals.css'

export function generateMetadata(): Metadata {
  return {
    title: 'CPE Academy - LMS',
    description: 'Bilingual Self-Paced Learning Management System',
    other: {
      ...Sentry.getTraceData()
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // In Next.js App Router with internationalization, 
  // the locale-specific layout provides the html/body structure
  return children
}

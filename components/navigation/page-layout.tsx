import { ReactNode } from 'react'
import PublicBreadcrumbs from './public-breadcrumbs'

interface PageLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  showBreadcrumbs?: boolean
  breadcrumbItems?: Array<{ title: string; href: string }>
  className?: string
}

export default function PageLayout({
  children,
  title,
  description,
  showBreadcrumbs = true,
  breadcrumbItems,
  className = ''
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <PublicBreadcrumbs items={breadcrumbItems} />
          </div>
        </div>
      )}

      {/* Page Header */}
      {(title || description) && (
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {title && (
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg text-gray-600 max-w-3xl">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
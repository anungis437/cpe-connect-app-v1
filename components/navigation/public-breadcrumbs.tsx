'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

interface BreadcrumbItem {
  title: string
  href: string
}

interface PublicBreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export default function PublicBreadcrumbs({ items, className = '' }: PublicBreadcrumbsProps) {
  const params = useParams()
  const pathname = usePathname()
  const currentLocale = params.locale || 'fr'
  const isEnglish = currentLocale === 'en'

  // Auto-generate breadcrumbs from path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items

    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Remove locale from segments
    const segments = pathSegments.slice(1)
    
    // Build breadcrumbs from path segments
    let currentPath = `/${currentLocale}`
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Convert segment to readable title
      const title = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      breadcrumbs.push({
        title,
        href: currentPath
      })
    })

    return breadcrumbs
  }

  const breadcrumbItems = generateBreadcrumbs()

  // Don't show breadcrumbs on homepage
  if (breadcrumbItems.length === 0) return null

  const homeLabel = isEnglish ? 'Home' : 'Accueil'

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        href={`/${currentLocale}`}
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <HomeIcon className="h-4 w-4 mr-1" />
        {homeLabel}
      </Link>
      
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1
        
        return (
          <div key={item.href} className="flex items-center">
            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            {isLast ? (
              <span className="text-gray-900 font-medium">
                {item.title}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.title}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
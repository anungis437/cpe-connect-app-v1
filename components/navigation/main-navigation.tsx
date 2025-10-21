import Link from 'next/link'
import { Button } from '@/components/ui'
import { Palette, Home, BookOpen, User } from 'lucide-react'

/**
 * Main Navigation Component
 * 
 * Simple navigation for the CPE Connect platform
 */
export function MainNavigation() {
  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                CPE Connect
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/">
                <Button variant="ghost" leftIcon={<Home className="h-4 w-4" />}>
                  Home
                </Button>
              </Link>
              <Link href="/design-system">
                <Button variant="ghost" leftIcon={<Palette className="h-4 w-4" />}>
                  Design System
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" leftIcon={<User className="h-4 w-4" />}>
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default MainNavigation
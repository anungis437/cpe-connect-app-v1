import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/courses',
  '/profile', 
  '/settings',
  '/admin',
  '/api/private'
]

// Routes that require organization admin permissions
const orgAdminRoutes = [
  '/admin',
  '/users',
  '/organization'
]

// Routes that should redirect authenticated users away
const authRoutes = [
  '/auth/signin',
  '/auth/signup', 
  '/auth/forgot-password'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files and public API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') ||
    (pathname.startsWith('/api') && !pathname.startsWith('/api/private'))
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Middleware auth error:', error)
    }

    const isAuthenticated = !!session?.user
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.includes(pathname)
    const isOrgAdminRoute = orgAdminRoutes.some(route => pathname.startsWith(route))

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect unauthenticated users to sign in
    if (!isAuthenticated && isProtectedRoute) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Add user info to request headers for downstream consumption
    if (isAuthenticated && session.user) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', session.user.id)
      requestHeaders.set('x-user-email', session.user.email || '')

      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

  } catch (error) {
    console.error('Middleware error:', error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\..*|api/auth).*)',
  ],
}

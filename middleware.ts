import createIntlMiddleware from 'next-intl/middleware'

export default createIntlMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'fr'],
  
  // Used when no locale matches
  defaultLocale: 'en'
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}

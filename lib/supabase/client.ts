import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // Enhanced security with PKCE
        debug: process.env.NODE_ENV === 'development',
      },
      global: {
        headers: {
          'X-Client-Info': 'cpe-connect-web',
          'X-Client-Version': '1.0.0',
        },
      },
      cookies: {
        name: 'cpe-connect-auth',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    }
  )
}

// Export singleton instance for consistent usage
export const supabase = createClient()

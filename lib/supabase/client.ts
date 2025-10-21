// @ts-nocheck
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
        get(name: string) {
          if (typeof document !== 'undefined') {
            const cookies = document.cookie.split(';');
            const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
            return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
          }
          return undefined;
        },
        set(name: string, value: string, options: any) {
          if (typeof document !== 'undefined') {
            const { maxAge, secure, sameSite } = options;
            let cookieString = `${name}=${encodeURIComponent(value)}; path=/`;
            if (maxAge) cookieString += `; max-age=${maxAge}`;
            if (secure) cookieString += '; secure';
            if (sameSite) cookieString += `; samesite=${sameSite}`;
            document.cookie = cookieString;
          }
        },
        remove(name: string, options: any) {
          if (typeof document !== 'undefined') {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
          }
        }
      },
    }
  )
}

// Export singleton instance for consistent usage
export const supabase = createClient()

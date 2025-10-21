import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, email, fullName, locale } = await request.json()

    const supabase = createAdminClient()

    // Create user profile using admin client
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        preferred_locale: locale as 'en' | 'fr',
        role: 'learner',
      })

    if (error) {
      // If error is due to duplicate, ignore it (user already exists)
      if (error.code !== '23505') {
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Create profile error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

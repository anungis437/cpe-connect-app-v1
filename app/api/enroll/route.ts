import { createServerClient } from '@/lib/supabase/server'
import { sendEnrollmentEmail } from '@/lib/email/mailer'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 })
    }

    // Create enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
      })
      .select()
      .single()

    if (error) throw error

    // Get user and course details for email
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    // Send enrollment email
    if (profile && course) {
      await sendEnrollmentEmail(
        user.email!,
        profile.full_name,
        profile.preferred_locale === 'fr' ? course.title_fr : course.title_en,
        profile.preferred_locale
      )
    }

    return NextResponse.json({ success: true, enrollment })
  } catch (error: any) {
    console.error('Enrollment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

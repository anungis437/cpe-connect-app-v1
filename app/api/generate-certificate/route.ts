import { createServerClient } from '@/lib/supabase/server'
import { generateCertificatePDF, uploadCertificate } from '@/lib/pdf/certificate'
import { sendCertificateEmail } from '@/lib/email/mailer'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId } = await request.json()

    // Verify enrollment and completion
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('id', enrollmentId)
      .eq('user_id', user.id)
      .single()

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    if (enrollment.progress_percentage < 100) {
      return NextResponse.json({ error: 'Course not completed' }, { status: 400 })
    }

    if (enrollment.certificate_issued) {
      return NextResponse.json({ 
        success: true, 
        certificateUrl: enrollment.certificate_url 
      })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    // Generate certificate
    const certificateData = {
      userName: profile?.full_name || user.email || '',
      courseName: profile?.preferred_locale === 'fr' 
        ? enrollment.course.title_fr 
        : enrollment.course.title_en,
      completionDate: new Date().toLocaleDateString(
        profile?.preferred_locale === 'fr' ? 'fr-FR' : 'en-US'
      ),
      certificateId: enrollmentId,
      locale: profile?.preferred_locale || 'en' as 'en' | 'fr',
    }

    const pdfBuffer = await generateCertificatePDF(certificateData)
    const certificateUrl = await uploadCertificate(
      user.id,
      enrollment.course_id,
      pdfBuffer
    )

    // Update enrollment
    await supabase
      .from('enrollments')
      .update({
        certificate_issued: true,
        certificate_url: certificateUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)

    // Send certificate email
    if (profile) {
      await sendCertificateEmail(
        user.email!,
        profile.full_name,
        certificateData.courseName,
        certificateUrl,
        profile.preferred_locale
      )
    }

    return NextResponse.json({ 
      success: true, 
      certificateUrl 
    })
  } catch (error: any) {
    console.error('Generate certificate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

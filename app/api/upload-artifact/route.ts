// @ts-nocheck
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const enrollmentId = formData.get('enrollmentId') as string

    if (!file || !enrollmentId) {
      return NextResponse.json({ error: 'Missing file or enrollmentId' }, { status: 400 })
    }

    // Verify enrollment belongs to user
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .eq('user_id', user.id)
      .single()

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Upload file to Supabase storage
    const fileName = `artifacts/${enrollmentId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('artifacts')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('artifacts')
      .getPublicUrl(fileName)

    // Record in database
    const { data: artifact, error: dbError } = await supabase
      .from('artifacts')
      .insert({
        enrollment_id: enrollmentId,
        file_name: file.name,
        file_url: fileName,
        file_type: file.type,
      })
      .select()
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ 
      success: true, 
      artifact,
      url: urlData.publicUrl
    })
  } catch (error: any) {
    console.error('Upload artifact error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

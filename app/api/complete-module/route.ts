import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentId, moduleId, quizScore } = await request.json()

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

    // Update or create module progress
    const { data: progress, error } = await supabase
      .from('module_progress')
      .upsert({
        enrollment_id: enrollmentId,
        module_id: moduleId,
        completed: true,
        quiz_score: quizScore,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Calculate overall progress
    const { data: course } = await supabase
      .from('courses')
      .select('*, modules(*)')
      .eq('id', enrollment.course_id)
      .single()

    const { data: allProgress } = await supabase
      .from('module_progress')
      .select('*')
      .eq('enrollment_id', enrollmentId)

    const totalModules = course?.modules?.length || 0
    const completedModules = allProgress?.filter(p => p.completed).length || 0
    const progressPercentage = totalModules > 0 
      ? Math.round((completedModules / totalModules) * 100) 
      : 0

    // Update enrollment progress
    await supabase
      .from('enrollments')
      .update({ progress_percentage: progressPercentage })
      .eq('id', enrollmentId)

    return NextResponse.json({ 
      success: true, 
      progress,
      progressPercentage 
    })
  } catch (error: any) {
    console.error('Complete module error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

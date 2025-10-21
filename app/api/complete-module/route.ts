// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError, 
  authenticateRequest,
  checkPermission,
  ERROR_CODES,
  logApiRequest,
  addSecurityHeaders
} from '@/lib/api/utils'
import { uuidSchema } from '@/lib/validations/schemas'

// Module completion schema
const completeModuleSchema = z.object({
  enrollment_id: uuidSchema,
  module_id: uuidSchema,
  time_spent_minutes: z.number().min(0).max(1440).optional(), // Max 24 hours
  quiz_score: z.number().min(0).max(100).optional(),
  completion_data: z.record(z.string(), z.any()).optional()
})

type CompleteModuleInput = z.infer<typeof completeModuleSchema>

// Complete module
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let userId: string | undefined
  let organizationId: string | undefined
  
  try {
    // Authenticate request
    const auth = await authenticateRequest()
    if (!auth) {
      const response = createErrorResponse(
        ERROR_CODES.UNAUTHORIZED,
        'Authentication required',
        401
      )
      return addSecurityHeaders(response)
    }
    
    const { user, supabase } = auth
    userId = user.id
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData: CompleteModuleInput = completeModuleSchema.parse(body)
    
    // Verify enrollment exists and belongs to user
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        *,
        user:users!enrollments_user_id_fkey(organization_id)
      `)
      .eq('id', validatedData.enrollment_id)
      .single()
    
    if (enrollmentError || !enrollment) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Enrollment not found',
        404
      )
      logApiRequest('POST', '/api/complete-module', userId, organizationId, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    organizationId = (enrollment as any).user?.organization_id
    
    // Check if user owns the enrollment or has permission to update progress
    const isOwner = (enrollment as any).user_id === user.id
    const canUpdateProgress = await checkPermission(
      user.id,
      'update_progress',
      organizationId,
      supabase
    )
    
    if (!isOwner && !canUpdateProgress) {
      const response = createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Insufficient permissions to update progress for this enrollment',
        403
      )
      logApiRequest('POST', '/api/complete-module', userId, organizationId, Date.now() - startTime, 403)
      return addSecurityHeaders(response)
    }
    
    // Verify module exists and belongs to the course
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', validatedData.module_id)
      .eq('course_id', enrollment.course_id)
      .single()
    
    if (moduleError || !module) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Module not found or does not belong to this course',
        404
      )
      logApiRequest('POST', '/api/complete-module', userId, organizationId, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    // Check if module is already completed
    const { data: existingProgress } = await supabase
      .from('module_progress')
      .select('*')
      .eq('enrollment_id', validatedData.enrollment_id)
      .eq('module_id', validatedData.module_id)
      .single()
    
    const now = new Date().toISOString()
    
    // Create or update module progress
    const progressData = {
      enrollment_id: validatedData.enrollment_id,
      module_id: validatedData.module_id,
      completed: true,
      completed_at: now,
      time_spent_minutes: validatedData.time_spent_minutes,
      quiz_score: validatedData.quiz_score,
      completion_data: validatedData.completion_data || {}
    }
    
    let moduleProgress
    if (existingProgress) {
      // Update existing progress
      const { data: updatedProgress, error: updateError } = await supabase
        .from('module_progress')
        .update({
          ...progressData,
          updated_at: now
        })
        .eq('id', existingProgress.id)
        .select(`
          *,
          module:modules(
            id,
            title_en,
            title_fr,
            order_index
          )
        `)
        .single()
      
      if (updateError) {
        throw updateError
      }
      moduleProgress = updatedProgress
    } else {
      // Create new progress record
      const { data: newProgress, error: insertError } = await supabase
        .from('module_progress')
        .insert({
          ...progressData,
          created_at: now,
          updated_at: now
        })
        .select(`
          *,
          module:modules(
            id,
            title_en,
            title_fr,
            order_index
          )
        `)
        .single()
      
      if (insertError) {
        throw insertError
      }
      moduleProgress = newProgress
    }
    
    // Calculate overall course progress
    const { data: courseModules } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', enrollment.course_id)
      .order('order_index', { ascending: true })
    
    const { data: allProgress } = await supabase
      .from('module_progress')
      .select('module_id, completed')
      .eq('enrollment_id', validatedData.enrollment_id)
      .eq('completed', true)
    
    const totalModules = courseModules?.length || 0
    const completedModules = allProgress?.length || 0
    const progressPercentage = totalModules > 0 
      ? Math.round((completedModules / totalModules) * 100) 
      : 0
    
    // Update enrollment progress
    const enrollmentUpdateData: any = {
      progress_percentage: progressPercentage,
      updated_at: now
    }
    
    // If course is now 100% complete, mark as completed
    if (progressPercentage === 100 && !enrollment.completed_at) {
      enrollmentUpdateData.completed_at = now
    }
    
    const { data: updatedEnrollment, error: enrollmentUpdateError } = await supabase
      .from('enrollments')
      .update(enrollmentUpdateData)
      .eq('id', validatedData.enrollment_id)
      .select(`
        *,
        course:courses(
          id,
          title_en,
          title_fr
        )
      `)
      .single()
    
    if (enrollmentUpdateError) {
      throw enrollmentUpdateError
    }
    
    // Get next module suggestion
    const { data: nextModule } = await supabase
      .from('modules')
      .select('id, title_en, title_fr, order_index')
      .eq('course_id', enrollment.course_id)
      .gt('order_index', module.order_index)
      .order('order_index', { ascending: true })
      .limit(1)
      .single()
    
    // Check if next module is already completed
    let nextModuleProgress = null
    if (nextModule) {
      const { data: nextProgress } = await supabase
        .from('module_progress')
        .select('completed')
        .eq('enrollment_id', validatedData.enrollment_id)
        .eq('module_id', nextModule.id)
        .single()
      
      nextModuleProgress = nextProgress
    }
    
    const responseData = {
      module_progress: moduleProgress,
      enrollment: updatedEnrollment,
      overall_progress: {
        percentage: progressPercentage,
        completed_modules: completedModules,
        total_modules: totalModules,
        is_course_complete: progressPercentage === 100
      },
      next_module: nextModule && !nextModuleProgress?.completed ? nextModule : null
    }
    
    const response = createSuccessResponse(
      responseData,
      `Module completed successfully. Course progress: ${progressPercentage}%`
    )
    
    logApiRequest('POST', '/api/complete-module', userId, organizationId, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('POST', '/api/complete-module', userId, organizationId, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

// Get module progress
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  let userId: string | undefined
  
  try {
    // Authenticate request
    const auth = await authenticateRequest()
    if (!auth) {
      const response = createErrorResponse(
        ERROR_CODES.UNAUTHORIZED,
        'Authentication required',
        401
      )
      return addSecurityHeaders(response)
    }
    
    const { user, supabase } = auth
    userId = user.id
    
    // Get query parameters
    const url = new URL(request.url)
    const enrollmentId = url.searchParams.get('enrollment_id')
    const moduleId = url.searchParams.get('module_id')
    
    if (!enrollmentId) {
      const response = createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        'Enrollment ID is required',
        400
      )
      logApiRequest('GET', '/api/complete-module', userId, undefined, Date.now() - startTime, 400)
      return addSecurityHeaders(response)
    }
    
    // Verify enrollment exists and user has access
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        *,
        user:users!enrollments_user_id_fkey(organization_id)
      `)
      .eq('id', enrollmentId)
      .single()
    
    if (enrollmentError || !enrollment) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Enrollment not found',
        404
      )
      logApiRequest('GET', '/api/complete-module', userId, undefined, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    // Check access permissions
    const isOwner = enrollment.user_id === user.id
    const canViewProgress = await checkPermission(
      user.id,
      'view_progress',
      enrollment.user?.organization_id,
      supabase
    )
    
    if (!isOwner && !canViewProgress) {
      const response = createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Insufficient permissions to view progress for this enrollment',
        403
      )
      logApiRequest('GET', '/api/complete-module', userId, enrollment.user?.organization_id, Date.now() - startTime, 403)
      return addSecurityHeaders(response)
    }
    
    // Build query for module progress
    let query = supabase
      .from('module_progress')
      .select(`
        *,
        module:modules(
          id,
          title_en,
          title_fr,
          order_index,
          video_url,
          duration_minutes
        )
      `)
      .eq('enrollment_id', enrollmentId)
    
    // Filter by specific module if provided
    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }
    
    // Order by module order
    query = query.order('module->order_index', { ascending: true })
    
    const { data: progress, error: progressError } = await query
    
    if (progressError) {
      throw progressError
    }
    
    // If specific module requested and not found, return module info without progress
    if (moduleId && (!progress || progress.length === 0)) {
      const { data: module } = await supabase
        .from('modules')
        .select('*')
        .eq('id', moduleId)
        .eq('course_id', enrollment.course_id)
        .single()
      
      if (module) {
        const responseData = {
          module_progress: null,
          module: module,
          enrollment_id: enrollmentId
        }
        
        const response = createSuccessResponse(
          responseData,
          'Module found but no progress recorded'
        )
        
        logApiRequest('GET', '/api/complete-module', userId, enrollment.user?.organization_id, Date.now() - startTime, 200)
        return addSecurityHeaders(response)
      }
    }
    
    const response = createSuccessResponse(
      progress || [],
      'Module progress retrieved successfully'
    )
    
    logApiRequest('GET', '/api/complete-module', userId, enrollment.user?.organization_id, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('GET', '/api/complete-module', userId, undefined, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

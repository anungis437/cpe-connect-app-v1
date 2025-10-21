import { NextRequest, NextResponse } from 'next/server'
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
import { 
  updateCourseSchema,
  type UpdateCourseInput
} from '@/lib/validations/schemas'

// Get single course
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const courseId = params.id
    
    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        creator:users!courses_created_by_fkey(
          id,
          full_name,
          email
        ),
        modules(
          id,
          title_en,
          title_fr,
          order_index,
          video_url,
          content_en,
          content_fr,
          created_at
        )
      `)
      .eq('id', courseId)
      .single()
    
    if (courseError) {
      if (courseError.code === 'PGRST116') {
        const response = createErrorResponse(
          ERROR_CODES.NOT_FOUND,
          'Course not found',
          404
        )
        logApiRequest('GET', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 404)
        return addSecurityHeaders(response)
      }
      throw courseError
    }
    
    // Check if user can view unpublished courses
    if (!course.is_published) {
      const canViewUnpublished = await checkPermission(
        user.id,
        'view_unpublished_courses',
        undefined,
        supabase
      )
      
      const isCreator = course.created_by === user.id
      
      if (!canViewUnpublished && !isCreator) {
        const response = createErrorResponse(
          ERROR_CODES.NOT_FOUND,
          'Course not found',
          404
        )
        logApiRequest('GET', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 404)
        return addSecurityHeaders(response)
      }
    }
    
    // Get user's enrollment status if any
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()
    
    const courseWithEnrollment = {
      ...course,
      enrollment: enrollment || null
    }
    
    const response = createSuccessResponse(
      courseWithEnrollment,
      'Course retrieved successfully'
    )
    
    logApiRequest('GET', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('GET', `/api/courses/${params?.id}`, userId, undefined, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

// Update course
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const courseId = params.id
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData: UpdateCourseInput = updateCourseSchema.parse(body)
    
    // Check if course exists and get current data
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id, created_by, is_published')
      .eq('id', courseId)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        const response = createErrorResponse(
          ERROR_CODES.NOT_FOUND,
          'Course not found',
          404
        )
        logApiRequest('PATCH', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 404)
        return addSecurityHeaders(response)
      }
      throw fetchError
    }
    
    // Check permissions
    const isCreator = existingCourse.created_by === user.id
    const canEditCourses = await checkPermission(
      user.id,
      'edit_courses',
      undefined,
      supabase
    )
    
    if (!isCreator && !canEditCourses) {
      const response = createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Insufficient permissions to edit this course',
        403
      )
      logApiRequest('PATCH', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 403)
      return addSecurityHeaders(response)
    }
    
    // Update course
    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }
    
    const { data: course, error: updateError } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select(`
        *,
        creator:users!courses_created_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .single()
    
    if (updateError) {
      throw updateError
    }
    
    const response = createSuccessResponse(
      course,
      'Course updated successfully'
    )
    
    logApiRequest('PATCH', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('PATCH', `/api/courses/${params?.id}`, userId, undefined, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

// Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const courseId = params.id
    
    // Check if course exists and get current data
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id, created_by, title_en')
      .eq('id', courseId)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        const response = createErrorResponse(
          ERROR_CODES.NOT_FOUND,
          'Course not found',
          404
        )
        logApiRequest('DELETE', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 404)
        return addSecurityHeaders(response)
      }
      throw fetchError
    }
    
    // Check permissions
    const isCreator = existingCourse.created_by === user.id
    const canDeleteCourses = await checkPermission(
      user.id,
      'delete_courses',
      undefined,
      supabase
    )
    
    if (!isCreator && !canDeleteCourses) {
      const response = createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Insufficient permissions to delete this course',
        403
      )
      logApiRequest('DELETE', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 403)
      return addSecurityHeaders(response)
    }
    
    // Check if course has enrollments
    const { data: enrollments, count } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact' })
      .eq('course_id', courseId)
    
    if (count && count > 0) {
      const response = createErrorResponse(
        ERROR_CODES.OPERATION_FAILED,
        'Cannot delete course with existing enrollments',
        400,
        { enrollment_count: count }
      )
      logApiRequest('DELETE', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 400)
      return addSecurityHeaders(response)
    }
    
    // Delete course
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
    
    if (deleteError) {
      throw deleteError
    }
    
    const response = createSuccessResponse(
      { id: courseId },
      'Course deleted successfully'
    )
    
    logApiRequest('DELETE', `/api/courses/${courseId}`, userId, undefined, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('DELETE', `/api/courses/${params?.id}`, userId, undefined, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}
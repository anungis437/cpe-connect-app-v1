// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError, 
  authenticateRequest,
  checkPermission,
  checkOrganizationAccess,
  ERROR_CODES,
  logApiRequest,
  addSecurityHeaders,
  buildQuery
} from '@/lib/api/utils'
import { 
  enrollUserSchema, 
  updateEnrollmentSchema,
  enrollmentFilterSchema,
  type EnrollUserInput,
  type UpdateEnrollmentInput,
  type EnrollmentFilterInput
} from '@/lib/validations/schemas'
import { sendEnrollmentEmail } from '@/lib/email/mailer'

// Create enrollment
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
    const validatedData: EnrollUserInput = enrollUserSchema.parse(body)
    
    // Check if user is enrolling themselves or someone else
    const isSelfEnrollment = validatedData.user_id === user.id
    
    // If enrolling someone else, check permissions
    if (!isSelfEnrollment) {
      const canEnrollOthers = await checkPermission(
        user.id,
        'enroll_users',
        undefined,
        supabase
      )
      
      if (!canEnrollOthers) {
        const response = createErrorResponse(
          ERROR_CODES.FORBIDDEN,
          'Insufficient permissions to enroll other users',
          403
        )
        logApiRequest('POST', '/api/enroll', userId, organizationId, Date.now() - startTime, 403)
        return addSecurityHeaders(response)
      }
    }
    
    // Verify course exists and is available
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', validatedData.course_id)
      .eq('is_published', true)
      .single()
    
    if (courseError || !course) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Course not found or not available',
        404
      )
      logApiRequest('POST', '/api/enroll', userId, organizationId, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    // Verify user exists and get profile
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', validatedData.user_id)
      .single()
    
    if (userError || !targetUser) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'User not found',
        404
      )
      logApiRequest('POST', '/api/enroll', userId, organizationId, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    organizationId = targetUser.organization_id
    
    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', validatedData.user_id)
      .eq('course_id', validatedData.course_id)
      .single()
    
    if (existingEnrollment) {
      const response = createErrorResponse(
        ERROR_CODES.ALREADY_EXISTS,
        'User is already enrolled in this course',
        409
      )
      logApiRequest('POST', '/api/enroll', userId, organizationId, Date.now() - startTime, 409)
      return addSecurityHeaders(response)
    }
    
    // Note: Prerequisites checking will be implemented once course schema is extended
    
    // Create enrollment
    const enrollmentData = {
      user_id: validatedData.user_id,
      course_id: validatedData.course_id,
      enrolled_at: new Date().toISOString(),
      progress_percentage: 0
    }
    
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .insert(enrollmentData)
      .select(`
        *,
        course:courses(
          id,
          title_en,
          title_fr,
          duration_minutes
        ),
        user:users!enrollments_user_id_fkey(
          id,
          full_name,
          email,
          preferred_locale
        )
      `)
      .single()
    
    if (enrollmentError) {
      throw enrollmentError
    }
    
    // Send enrollment email (async, don't wait)
    if (enrollment.user && enrollment.course) {
      const courseTitle = targetUser.preferred_locale === 'fr' 
        ? enrollment.course.title_fr 
        : enrollment.course.title_en
      
      sendEnrollmentEmail(
        targetUser.email,
        targetUser.full_name,
        courseTitle,
        targetUser.preferred_locale
      ).catch(error => {
        console.error('Failed to send enrollment email:', error)
      })
    }
    
    const response = createSuccessResponse(
      enrollment,
      'User enrolled successfully'
    )
    
    logApiRequest('POST', '/api/enroll', userId, organizationId, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('POST', '/api/enroll', userId, organizationId, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

// Update enrollment
export async function PATCH(request: NextRequest) {
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
    
    // Get enrollment ID from URL
    const url = new URL(request.url)
    const enrollmentId = url.searchParams.get('id')
    
    if (!enrollmentId) {
      const response = createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        'Enrollment ID is required',
        400
      )
      logApiRequest('PATCH', '/api/enroll', userId, organizationId, Date.now() - startTime, 400)
      return addSecurityHeaders(response)
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData: UpdateEnrollmentInput = updateEnrollmentSchema.parse(body)
    
    // Get existing enrollment
    const { data: existingEnrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select(`
        *,
        user:user_profiles!enrollments_user_id_fkey(organization_id)
      `)
      .eq('id', enrollmentId)
      .single()
    
    if (fetchError || !existingEnrollment) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Enrollment not found',
        404
      )
      logApiRequest('PATCH', '/api/enroll', userId, organizationId, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    organizationId = existingEnrollment.user?.organization_id
    
    // Check if user owns the enrollment or has permission to modify
    const isOwner = existingEnrollment.user_id === user.id
    const canModifyEnrollments = await checkPermission(
      user.id,
      'manage_enrollments',
      organizationId,
      supabase
    )
    
    if (!isOwner && !canModifyEnrollments) {
      const response = createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Insufficient permissions to modify this enrollment',
        403
      )
      logApiRequest('PATCH', '/api/enroll', userId, organizationId, Date.now() - startTime, 403)
      return addSecurityHeaders(response)
    }
    
    // Update enrollment
    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    }
    
    // Set completion date if status is completed
    if (validatedData.status === 'completed' && !validatedData.completion_date) {
      updateData.completion_date = new Date().toISOString()
    }
    
    const { data: enrollment, error: updateError } = await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
      .select(`
        *,
        course:courses(
          id,
          title_en,
          title_fr,
          cpe_credits
        ),
        user:user_profiles!enrollments_user_id_fkey(
          user_id,
          full_name,
          email,
          preferred_locale
        )
      `)
      .single()
    
    if (updateError) {
      throw updateError
    }
    
    const response = createSuccessResponse(
      enrollment,
      'Enrollment updated successfully'
    )
    
    logApiRequest('PATCH', '/api/enroll', userId, organizationId, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('PATCH', '/api/enroll', userId, organizationId, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

// Get enrollments
export async function GET(request: NextRequest) {
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
    
    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const filters: EnrollmentFilterInput = enrollmentFilterSchema.parse(queryParams)
    
    // If no user_id specified, default to current user
    if (!filters.user_id) {
      filters.user_id = user.id
    }
    
    // Check permissions if querying other users' enrollments
    if (filters.user_id !== user.id) {
      const canViewEnrollments = await checkPermission(
        user.id,
        'view_enrollments',
        undefined,
        supabase
      )
      
      if (!canViewEnrollments) {
        const response = createErrorResponse(
          ERROR_CODES.FORBIDDEN,
          'Insufficient permissions to view other users\' enrollments',
          403
        )
        logApiRequest('GET', '/api/enroll', userId, organizationId, Date.now() - startTime, 403)
        return addSecurityHeaders(response)
      }
    }
    
    // Build query with filters
    let query = supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(
          id,
          title_en,
          title_fr,
          duration_minutes,
          cpe_credits,
          category,
          difficulty_level
        ),
        user:user_profiles!enrollments_user_id_fkey(
          user_id,
          full_name,
          email,
          organization_id
        )
      `, { count: 'exact' })
    
    // Apply filters
    if (filters.user_id) query = query.eq('user_id', filters.user_id)
    if (filters.course_id) query = query.eq('course_id', filters.course_id)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.enrollment_type) query = query.eq('enrollment_type', filters.enrollment_type)
    if (filters.from_date) query = query.gte('enrolled_at', filters.from_date)
    if (filters.to_date) query = query.lte('enrolled_at', filters.to_date)
    
    // Apply pagination
    const { page, limit } = filters
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    // Order by enrollment date
    query = query.order('enrolled_at', { ascending: false })
    
    const { data: enrollments, error: queryError, count } = await query
    
    if (queryError) {
      throw queryError
    }
    
    const response = createSuccessResponse(
      enrollments || [],
      'Enrollments retrieved successfully',
      {
        page: filters.page,
        limit: filters.limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / filters.limit)
      }
    )
    
    logApiRequest('GET', '/api/enroll', userId, organizationId, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('GET', '/api/enroll', userId, organizationId, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

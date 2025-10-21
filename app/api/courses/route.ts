import { NextRequest, NextResponse } from 'next/server'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError, 
  authenticateRequest,
  checkPermission,
  ERROR_CODES,
  logApiRequest,
  addSecurityHeaders,
  createPagination
} from '@/lib/api/utils'
import { 
  createCourseSchema, 
  updateCourseSchema,
  courseFilterSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CourseFilterInput
} from '@/lib/validations/schemas'

// Create course
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
    
    // Check permission to create courses
    const canCreateCourses = await checkPermission(
      user.id,
      'create_courses',
      undefined,
      supabase
    )
    
    if (!canCreateCourses) {
      const response = createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Insufficient permissions to create courses',
        403
      )
      logApiRequest('POST', '/api/courses', userId, organizationId, Date.now() - startTime, 403)
      return addSecurityHeaders(response)
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData: CreateCourseInput = createCourseSchema.parse(body)
    
    // Create course
    const courseData = {
      title_en: validatedData.title_en,
      title_fr: validatedData.title_fr,
      description_en: validatedData.description_en,
      description_fr: validatedData.description_fr,
      duration_minutes: validatedData.duration_minutes,
      created_by: user.id,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select(`
        *,
        creator:users!courses_created_by_fkey(
          id,
          full_name,
          email
        )
      `)
      .single()
    
    if (courseError) {
      throw courseError
    }
    
    const response = createSuccessResponse(
      course,
      'Course created successfully'
    )
    
    logApiRequest('POST', '/api/courses', userId, organizationId, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('POST', '/api/courses', userId, organizationId, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

// Get courses
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
    const filters: CourseFilterInput = courseFilterSchema.parse(queryParams)
    
    // Build query
    let query = supabase
      .from('courses')
      .select(`
        *,
        creator:users!courses_created_by_fkey(
          id,
          full_name
        ),
        enrollments!left(count)
      `, { count: 'exact' })
    
    // Apply filters
    if (filters.search) {
      query = query.or(`title_en.ilike.%${filters.search}%,title_fr.ilike.%${filters.search}%,description_en.ilike.%${filters.search}%,description_fr.ilike.%${filters.search}%`)
    }
    
    if (filters.published !== undefined) {
      query = query.eq('is_published', filters.published)
    } else {
      // By default, only show published courses to non-instructors
      const canViewUnpublished = await checkPermission(
        user.id,
        'view_unpublished_courses',
        undefined,
        supabase
      )
      
      if (!canViewUnpublished) {
        query = query.eq('is_published', true)
      }
    }
    
    // Apply pagination
    const { page, limit } = filters
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    // Order by creation date
    query = query.order('created_at', { ascending: false })
    
    const { data: courses, error: queryError, count } = await query
    
    if (queryError) {
      throw queryError
    }
    
    const response = createSuccessResponse(
      courses || [],
      'Courses retrieved successfully',
      createPagination(page, limit, count || 0)
    )
    
    logApiRequest('GET', '/api/courses', userId, organizationId, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('GET', '/api/courses', userId, organizationId, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}
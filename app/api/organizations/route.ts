// @ts-nocheck
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
  createOrganizationSchema, 
  updateOrganizationSchema,
  paginationSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput
} from '@/lib/validations/schemas'

// Create organization
export async function POST(request: NextRequest) {
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
    
    // Check permission to create organizations
    const canCreateOrg = await checkPermission(
      user.id,
      'create_organizations',
      undefined,
      supabase
    )
    
    if (!canCreateOrg) {
      const response = createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Insufficient permissions to create organizations',
        403
      )
      logApiRequest('POST', '/api/organizations', userId, undefined, Date.now() - startTime, 403)
      return addSecurityHeaders(response)
    }
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData: CreateOrganizationInput = createOrganizationSchema.parse(body)
    
    // Check if organization slug already exists
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', validatedData.name)
      .single()
    
    if (existingOrg) {
      const response = createErrorResponse(
        ERROR_CODES.ALREADY_EXISTS,
        'Organization with this name already exists',
        409
      )
      logApiRequest('POST', '/api/organizations', userId, undefined, Date.now() - startTime, 409)
      return addSecurityHeaders(response)
    }
    
    // Create organization
    const orgData = {
      name: validatedData.name,
      type: validatedData.type,
      project_code: validatedData.project_code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert(orgData)
      .select()
      .single()
    
    if (orgError) {
      throw orgError
    }
    
    // Create admin membership for the creator
    const { error: membershipError } = await supabase
      .from('organization_memberships')
      .insert({
        user_id: user.id,
        organization_id: organization.id,
        role: 'admin',
        joined_at: new Date().toISOString(),
        is_active: true
      })
    
    if (membershipError) {
      console.warn('Failed to create admin membership:', membershipError)
    }
    
    const response = createSuccessResponse(
      organization,
      'Organization created successfully'
    )
    
    logApiRequest('POST', '/api/organizations', userId, organization.id, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('POST', '/api/organizations', userId, undefined, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

// Get organizations
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
    
    // Parse query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const { page, limit } = paginationSchema.parse(queryParams)
    
    const search = url.searchParams.get('search')
    const type = url.searchParams.get('type')
    
    // Check if user can view all organizations or just their own
    const canViewAllOrgs = await checkPermission(
      user.id,
      'view_all_organizations',
      undefined,
      supabase
    )
    
    let query = supabase
      .from('organizations')
      .select('*', { count: 'exact' })
    
    // If user can't view all organizations, only show organizations they're a member of
    if (!canViewAllOrgs) {
      const { data: userMemberships } = await supabase
        .from('organization_memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
      
      const orgIds = userMemberships?.map((m: any) => m.organization_id) || []
      
      if (orgIds.length === 0) {
        const response = createSuccessResponse(
          [],
          'Organizations retrieved successfully',
          createPagination(page, limit, 0)
        )
        logApiRequest('GET', '/api/organizations', userId, undefined, Date.now() - startTime, 200)
        return addSecurityHeaders(response)
      }
      
      query = query.in('id', orgIds)
    }
    
    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,project_code.ilike.%${search}%`)
    }
    if (type) {
      query = query.eq('type', type)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    // Order by name
    query = query.order('name', { ascending: true })
    
    const { data: organizations, error: queryError, count } = await query
    
    if (queryError) {
      throw queryError
    }
    
    const response = createSuccessResponse(
      organizations || [],
      'Organizations retrieved successfully',
      createPagination(page, limit, count || 0)
    )
    
    logApiRequest('GET', '/api/organizations', userId, undefined, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('GET', '/api/organizations', userId, undefined, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

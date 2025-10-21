import { NextRequest, NextResponse } from 'next/server'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleApiError, 
  authenticateRequest,
  checkOrganizationAccess,
  ERROR_CODES,
  logApiRequest,
  addSecurityHeaders
} from '@/lib/api/utils'
import { 
  createUserProfileSchema, 
  updateUserProfileSchema,
  type CreateUserProfileInput,
  type UpdateUserProfileInput 
} from '@/lib/validations/schemas'

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
    const validatedData: CreateUserProfileInput = createUserProfileSchema.parse(body)
    organizationId = validatedData.organization_id
    
    // Check organization access if provided
    if (validatedData.organization_id) {
      const hasAccess = await checkOrganizationAccess(
        user.id, 
        validatedData.organization_id, 
        supabase
      )
      
      if (!hasAccess) {
        const response = createErrorResponse(
          ERROR_CODES.FORBIDDEN,
          'Access denied to specified organization',
          403
        )
        logApiRequest('POST', '/api/create-profile', userId, organizationId, Date.now() - startTime, 403)
        return addSecurityHeaders(response)
      }
    }
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (existingProfile) {
      const response = createErrorResponse(
        ERROR_CODES.ALREADY_EXISTS,
        'User profile already exists. Use PATCH to update.',
        409
      )
      logApiRequest('POST', '/api/create-profile', userId, organizationId, Date.now() - startTime, 409)
      return addSecurityHeaders(response)
    }
    
    // Create user profile
    const profileData = {
      user_id: user.id,
      email: validatedData.email,
      full_name: validatedData.full_name,
      organization_id: validatedData.organization_id,
      preferred_locale: validatedData.preferred_locale,
      phone: validatedData.phone,
      timezone: validatedData.timezone,
      preferences: validatedData.preferences || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select(`
        *,
        organization:organizations(
          id,
          name,
          slug,
          type
        )
      `)
      .single()
    
    if (profileError) {
      throw profileError
    }
    
    // If organization membership, create membership record
    if (validatedData.organization_id) {
      const { error: membershipError } = await supabase
        .from('organization_memberships')
        .insert({
          user_id: user.id,
          organization_id: validatedData.organization_id,
          role: 'learner', // Default role
          joined_at: new Date().toISOString(),
          is_active: true
        })
      
      if (membershipError) {
        console.warn('Failed to create organization membership:', membershipError)
      }
    }
    
    const response = createSuccessResponse(
      profile,
      'User profile created successfully'
    )
    
    logApiRequest('POST', '/api/create-profile', userId, organizationId, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('POST', '/api/create-profile', userId, organizationId, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

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
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData: UpdateUserProfileInput = updateUserProfileSchema.parse(body)
    organizationId = validatedData.organization_id
    
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single()
    
    if (fetchError || !existingProfile) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'User profile not found',
        404
      )
      logApiRequest('PATCH', '/api/create-profile', userId, organizationId, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    // Check organization access if changing organization
    if (validatedData.organization_id && validatedData.organization_id !== existingProfile.organization_id) {
      const hasAccess = await checkOrganizationAccess(
        user.id, 
        validatedData.organization_id, 
        supabase
      )
      
      if (!hasAccess) {
        const response = createErrorResponse(
          ERROR_CODES.FORBIDDEN,
          'Access denied to specified organization',
          403
        )
        logApiRequest('PATCH', '/api/create-profile', userId, organizationId, Date.now() - startTime, 403)
        return addSecurityHeaders(response)
      }
    }
    
    // Update user profile
    const updateData = {
      ...validatedData,
      updated_at: new Date().toISOString(),
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select(`
        *,
        organization:organizations(
          id,
          name,
          slug,
          type
        )
      `)
      .single()
    
    if (profileError) {
      throw profileError
    }
    
    const response = createSuccessResponse(
      profile,
      'User profile updated successfully'
    )
    
    logApiRequest('PATCH', '/api/create-profile', userId, organizationId, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('PATCH', '/api/create-profile', userId, organizationId, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

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
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          slug,
          type,
          settings
        ),
        memberships:organization_memberships(
          id,
          role,
          joined_at,
          is_active,
          organization:organizations(
            id,
            name,
            slug,
            type
          )
        )
      `)
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        const response = createErrorResponse(
          ERROR_CODES.NOT_FOUND,
          'User profile not found',
          404
        )
        logApiRequest('GET', '/api/create-profile', userId, undefined, Date.now() - startTime, 404)
        return addSecurityHeaders(response)
      }
      throw profileError
    }
    
    const response = createSuccessResponse(
      profile,
      'User profile retrieved successfully'
    )
    
    logApiRequest('GET', '/api/create-profile', userId, profile.organization_id, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('GET', '/api/create-profile', userId, undefined, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

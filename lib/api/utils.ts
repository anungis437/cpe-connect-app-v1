import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Error codes
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  
  // Operations
  OPERATION_FAILED: 'OPERATION_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Business Logic
  ENROLLMENT_LIMIT_EXCEEDED: 'ENROLLMENT_LIMIT_EXCEEDED',
  COURSE_NOT_AVAILABLE: 'COURSE_NOT_AVAILABLE',
  CERTIFICATE_ALREADY_ISSUED: 'CERTIFICATE_ALREADY_ISSUED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Generic
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiResponse['pagination']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    pagination
  })
}

// Error response helper
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details
      }
    },
    { status }
  )
}

// Validation error helper
export function createValidationErrorResponse(error: ZodError): NextResponse<ApiResponse> {
  return createErrorResponse(
    ERROR_CODES.VALIDATION_ERROR,
    'Validation failed',
    400,
    error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  )
}

// Authentication middleware helper
export async function authenticateRequest(): Promise<{
  user: any
  session: any
  supabase: ReturnType<typeof createClient>
} | null> {
  try {
    const supabase = createClient()
    
    const {
      data: { user, session },
      error
    } = await supabase.auth.getUser()
    
    if (error || !user || !session) {
      return null
    }
    
    return { user, session, supabase }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// Authorization helper - check if user has required permission
export async function checkPermission(
  userId: string,
  permission: string,
  organizationId?: string,
  supabase?: ReturnType<typeof createClient>
): Promise<boolean> {
  try {
    if (!supabase) {
      supabase = createClient()
    }
    
    // Get user permissions
    const { data: userPermissions, error } = await supabase
      .from('user_permissions')
      .select(`
        permission_name,
        organization_id
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (error) {
      console.error('Permission check error:', error)
      return false
    }
    
    // Check if user has the required permission
    const hasPermission = userPermissions?.some(perm => {
      const hasRequiredPermission = perm.permission_name === permission
      const hasOrgAccess = !organizationId || perm.organization_id === organizationId
      return hasRequiredPermission && hasOrgAccess
    }) ?? false
    
    return hasPermission
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

// Organization access helper
export async function checkOrganizationAccess(
  userId: string,
  organizationId: string,
  supabase?: ReturnType<typeof createClient>
): Promise<boolean> {
  try {
    if (!supabase) {
      supabase = createClient()
    }
    
    const { data: membership, error } = await supabase
      .from('organization_memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Organization access check error:', error)
      return false
    }
    
    return !!membership
  } catch (error) {
    console.error('Organization access check error:', error)
    return false
  }
}

// Handle common API errors
export function handleApiError(error: any): NextResponse<ApiResponse> {
  console.error('API Error:', error)
  
  // Zod validation errors
  if (error instanceof ZodError) {
    return createValidationErrorResponse(error)
  }
  
  // Supabase errors
  if (error?.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return createErrorResponse(
          ERROR_CODES.ALREADY_EXISTS,
          'Resource already exists',
          409,
          error.detail
        )
      case '23503': // Foreign key violation
        return createErrorResponse(
          ERROR_CODES.INVALID_INPUT,
          'Referenced resource does not exist',
          400,
          error.detail
        )
      case 'PGRST116': // Not found
        return createErrorResponse(
          ERROR_CODES.NOT_FOUND,
          'Resource not found',
          404
        )
      case '42501': // Insufficient privilege
        return createErrorResponse(
          ERROR_CODES.FORBIDDEN,
          'Insufficient permissions',
          403
        )
      default:
        return createErrorResponse(
          ERROR_CODES.DATABASE_ERROR,
          'Database operation failed',
          500,
          error.message
        )
    }
  }
  
  // Network/timeout errors
  if (error?.name === 'NetworkError' || error?.code === 'ECONNREFUSED') {
    return createErrorResponse(
      ERROR_CODES.SERVICE_UNAVAILABLE,
      'Service temporarily unavailable',
      503
    )
  }
  
  // Generic error
  return createErrorResponse(
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    500,
    process.env.NODE_ENV === 'development' ? error.message : undefined
  )
}

// Pagination helper
export function createPagination(
  page: number,
  limit: number,
  total: number
): ApiResponse['pagination'] {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  }
}

// Query builder helper for filters and pagination
export function buildQuery(
  supabase: ReturnType<typeof createClient>,
  table: string,
  filters: Record<string, any> = {},
  pagination?: { page: number; limit: number },
  select = '*'
) {
  let query = supabase.from(table).select(select, { count: 'exact' })
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'search') {
        // Handle search across multiple fields - customize per table
        return
      } else if (Array.isArray(value)) {
        query = query.in(key, value)
      } else if (typeof value === 'string' && value.includes('%')) {
        query = query.like(key, value)
      } else {
        query = query.eq(key, value)
      }
    }
  })
  
  // Apply pagination
  if (pagination) {
    const { page, limit } = pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
  }
  
  return query
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const windowStart = now - windowMs
  
  const current = rateLimitMap.get(identifier)
  
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now })
    return true
  }
  
  if (current.count >= maxRequests) {
    return false
  }
  
  current.count++
  return true
}

// Security headers helper
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

// Request logging helper
export function logApiRequest(
  method: string,
  url: string,
  userId?: string,
  organizationId?: string,
  duration?: number,
  status?: number
) {
  const logData = {
    timestamp: new Date().toISOString(),
    method,
    url,
    userId,
    organizationId,
    duration,
    status,
    environment: process.env.NODE_ENV
  }
  
  // In production, send to logging service
  console.log('API Request:', JSON.stringify(logData))
}
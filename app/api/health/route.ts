import { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse, ERROR_CODES } from '@/lib/api/utils'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Health Check Endpoint
 * 
 * GET /api/health
 * 
 * Returns application health status including:
 * - Application status
 * - Database connectivity
 * - Environment information
 * - System uptime
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Basic application health
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      services: {
        database: 'unknown',
        storage: 'unknown',
      }
    }

    // Check database connectivity
    try {
      const supabase = await createServerClient()
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single()

      // If no error or just "no rows" error, database is healthy
      health.services.database = (!error || error.code === 'PGRST116') ? 'healthy' : 'unhealthy'
    } catch (dbError) {
      console.error('Database health check failed:', dbError)
      health.services.database = 'unhealthy'
    }

    // Check storage (Supabase storage)
    try {
      const supabase = await createServerClient()
      const { error } = await supabase.storage.listBuckets()
      health.services.storage = !error ? 'healthy' : 'unhealthy'
    } catch (storageError) {
      console.error('Storage health check failed:', storageError)
      health.services.storage = 'unhealthy'
    }

    // Calculate response time
    const responseTime = Date.now() - startTime
    
    // Determine overall health status
    const isHealthy = 
      health.services.database === 'healthy' && 
      health.services.storage === 'healthy' &&
      responseTime < 5000 // Response time under 5 seconds

    if (!isHealthy) {
      health.status = 'degraded'
    }

    // Set appropriate HTTP status
    const httpStatus = health.status === 'healthy' ? 200 : 503

    return createSuccessResponse(
      {
        ...health,
        responseTime: `${responseTime}ms`,
        checks: {
          database: health.services.database === 'healthy',
          storage: health.services.storage === 'healthy',
          responseTime: responseTime < 5000,
        }
      },
      'Health check completed'
    )

  } catch (error) {
    console.error('Health check error:', error)
    
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Health check failed',
      503,
      {
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - startTime}ms`,
        error: process.env.NODE_ENV === 'development' ? error : undefined
      }
    )
  }
}

/**
 * Detailed Health Check (requires authentication)
 * 
 * POST /api/health
 * 
 * Returns detailed system information for monitoring
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Basic auth check (implement your auth logic)
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse(
        ERROR_CODES.UNAUTHORIZED,
        'Authentication required for detailed health check',
        401
      )
    }

    // Get detailed system information
    const detailedHealth = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      versions: process.versions,
      env: {
        // Only include non-sensitive environment variables
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
        POWERBI_CLIENT_ID: process.env.POWERBI_CLIENT_ID ? 'set' : 'not set',
      }
    }

    return createSuccessResponse(
      detailedHealth,
      'Detailed health information'
    )

  } catch (error) {
    console.error('Detailed health check error:', error)
    
    return createErrorResponse(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      'Detailed health check failed',
      500
    )
  }
}
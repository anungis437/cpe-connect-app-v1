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
  addSecurityHeaders
} from '@/lib/api/utils'
import { 
  generateCertificateSchema,
  type GenerateCertificateInput
} from '@/lib/validations/schemas'
import { generateCertificatePDF, uploadCertificate } from '@/lib/pdf/certificate'
import { sendCertificateEmail } from '@/lib/email/mailer'

// Generate certificate
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
    const validatedData: GenerateCertificateInput = generateCertificateSchema.parse(body)
    
    // Verify enrollment exists and get details
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
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
          preferred_locale,
          organization_id
        )
      `)
      .eq('id', validatedData.enrollment_id)
      .single()
    
    if (enrollmentError || !enrollment) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Enrollment not found',
        404
      )
      logApiRequest('POST', '/api/generate-certificate', userId, organizationId, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    organizationId = enrollment.user?.organization_id
    
    // Check if user owns the enrollment or has permission to generate certificates
    const isOwner = enrollment.user_id === user.id
    const canGenerateCertificates = await checkPermission(
      user.id,
      'generate_certificates',
      organizationId,
      supabase
    )
    
    if (!isOwner && !canGenerateCertificates) {
      const response = createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Insufficient permissions to generate certificate for this enrollment',
        403
      )
      logApiRequest('POST', '/api/generate-certificate', userId, organizationId, Date.now() - startTime, 403)
      return addSecurityHeaders(response)
    }
    
    // Verify course completion
    if (enrollment.progress_percentage < 100) {
      const response = createErrorResponse(
        ERROR_CODES.COURSE_NOT_AVAILABLE,
        'Course must be completed before generating certificate',
        400,
        { 
          current_progress: enrollment.progress_percentage,
          required_progress: 100
        }
      )
      logApiRequest('POST', '/api/generate-certificate', userId, organizationId, Date.now() - startTime, 400)
      return addSecurityHeaders(response)
    }
    
    // Check if certificate already exists
    if (enrollment.certificate_issued && enrollment.certificate_url) {
      const response = createSuccessResponse(
        {
          certificate_url: enrollment.certificate_url,
          enrollment_id: enrollment.id,
          generated_at: enrollment.completed_at || enrollment.enrolled_at,
          already_exists: true
        },
        'Certificate already exists for this enrollment'
      )
      logApiRequest('POST', '/api/generate-certificate', userId, organizationId, Date.now() - startTime, 200)
      return addSecurityHeaders(response)
    }
    
    // Prepare certificate data
    const certificateData = {
      userName: enrollment.user?.full_name || enrollment.user?.email || 'Unknown User',
      courseName: enrollment.user?.preferred_locale === 'fr' 
        ? enrollment.course?.title_fr || enrollment.course?.title_en
        : enrollment.course?.title_en || enrollment.course?.title_fr,
      completionDate: validatedData.issue_date 
        ? new Date(validatedData.issue_date).toLocaleDateString(
            enrollment.user?.preferred_locale === 'fr' ? 'fr-FR' : 'en-US'
          )
        : new Date().toLocaleDateString(
            enrollment.user?.preferred_locale === 'fr' ? 'fr-FR' : 'en-US'
          ),
      certificateId: enrollment.id,
      locale: (enrollment.user?.preferred_locale || 'en') as 'en' | 'fr',
      courseDuration: enrollment.course?.duration_minutes || 0,
      expiryDate: validatedData.expiry_date 
        ? new Date(validatedData.expiry_date).toLocaleDateString(
            enrollment.user?.preferred_locale === 'fr' ? 'fr-FR' : 'en-US'
          )
        : undefined
    }
    
    try {
      // Generate PDF certificate
      const pdfBuffer = await generateCertificatePDF(certificateData)
      
      // Upload certificate
      const certificateUrl = await uploadCertificate(
        enrollment.user_id,
        enrollment.course_id,
        pdfBuffer
      )
      
      // Update enrollment with certificate info
      const updateData = {
        certificate_issued: true,
        certificate_url: certificateUrl,
        completed_at: validatedData.issue_date || new Date().toISOString()
      }
      
      const { data: updatedEnrollment, error: updateError } = await supabase
        .from('enrollments')
        .update(updateData)
        .eq('id', enrollment.id)
        .select(`
          *,
          course:courses(
            title_en,
            title_fr
          ),
          user:users!enrollments_user_id_fkey(
            full_name,
            email,
            preferred_locale
          )
        `)
        .single()
      
      if (updateError) {
        throw updateError
      }
      
      // Send certificate email (async, don't wait)
      if (enrollment.user && enrollment.course) {
        const courseName = enrollment.user.preferred_locale === 'fr' 
          ? enrollment.course.title_fr 
          : enrollment.course.title_en
        
        sendCertificateEmail(
          enrollment.user.email,
          enrollment.user.full_name,
          courseName || 'Course',
          certificateUrl,
          enrollment.user.preferred_locale || 'en'
        ).catch(error => {
          console.error('Failed to send certificate email:', error)
        })
      }
      
      const response = createSuccessResponse(
        {
          certificate_url: certificateUrl,
          enrollment_id: enrollment.id,
          generated_at: updateData.completed_at,
          certificate_data: certificateData,
          enrollment: updatedEnrollment
        },
        'Certificate generated successfully'
      )
      
      logApiRequest('POST', '/api/generate-certificate', userId, organizationId, Date.now() - startTime, 200)
      return addSecurityHeaders(response)
      
    } catch (pdfError) {
      console.error('Certificate generation error:', pdfError)
      
      const response = createErrorResponse(
        ERROR_CODES.EXTERNAL_SERVICE_ERROR,
        'Failed to generate certificate PDF',
        500,
        process.env.NODE_ENV === 'development' ? { 
          error: pdfError instanceof Error ? pdfError.message : 'Unknown PDF error'
        } : undefined
      )
      logApiRequest('POST', '/api/generate-certificate', userId, organizationId, Date.now() - startTime, 500)
      return addSecurityHeaders(response)
    }
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('POST', '/api/generate-certificate', userId, organizationId, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

// Get certificate
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
    
    // Get enrollment ID from query params
    const url = new URL(request.url)
    const enrollmentId = url.searchParams.get('enrollment_id')
    
    if (!enrollmentId) {
      const response = createErrorResponse(
        ERROR_CODES.BAD_REQUEST,
        'Enrollment ID is required',
        400
      )
      logApiRequest('GET', '/api/generate-certificate', userId, undefined, Date.now() - startTime, 400)
      return addSecurityHeaders(response)
    }
    
    // Get enrollment with certificate info
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        certificate_issued,
        certificate_url,
        completed_at,
        course:courses(
          title_en,
          title_fr
        ),
        user:users!enrollments_user_id_fkey(
          organization_id
        )
      `)
      .eq('id', enrollmentId)
      .single()
    
    if (enrollmentError || !enrollment) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Enrollment not found',
        404
      )
      logApiRequest('GET', '/api/generate-certificate', userId, undefined, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    // Check if user owns the enrollment or has permission to view certificates
    const isOwner = enrollment.user_id === user.id
    const canViewCertificates = await checkPermission(
      user.id,
      'view_certificates',
      enrollment.user?.organization_id,
      supabase
    )
    
    if (!isOwner && !canViewCertificates) {
      const response = createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'Insufficient permissions to view this certificate',
        403
      )
      logApiRequest('GET', '/api/generate-certificate', userId, enrollment.user?.organization_id, Date.now() - startTime, 403)
      return addSecurityHeaders(response)
    }
    
    // Check if certificate exists
    if (!enrollment.certificate_issued || !enrollment.certificate_url) {
      const response = createErrorResponse(
        ERROR_CODES.NOT_FOUND,
        'Certificate not generated for this enrollment',
        404
      )
      logApiRequest('GET', '/api/generate-certificate', userId, enrollment.user?.organization_id, Date.now() - startTime, 404)
      return addSecurityHeaders(response)
    }
    
    const certificateInfo = {
      enrollment_id: enrollment.id,
      certificate_url: enrollment.certificate_url,
      generated_at: enrollment.completed_at,
      course: enrollment.course
    }
    
    const response = createSuccessResponse(
      certificateInfo,
      'Certificate information retrieved successfully'
    )
    
    logApiRequest('GET', '/api/generate-certificate', userId, enrollment.user?.organization_id, Date.now() - startTime, 200)
    return addSecurityHeaders(response)
    
  } catch (error) {
    const response = handleApiError(error)
    logApiRequest('GET', '/api/generate-certificate', userId, undefined, Date.now() - startTime, response.status)
    return addSecurityHeaders(response)
  }
}

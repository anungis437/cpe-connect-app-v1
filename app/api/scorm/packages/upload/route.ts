import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SCORMPackageManager } from '@/lib/scorm/package-manager'
import { Database } from '@/types/database'

/**
 * Upload and Process SCORM Package
 * POST /api/scorm/packages/upload
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, user_role')
      .eq('id', user.id)
      .single() as { 
        data: { organization_id: string; user_role: Database['public']['Enums']['user_role_type'] } | null;
        error: any 
      }

    if (userError || !userData?.organization_id) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    // Check if user has upload permissions (CPE roles that can create content)
    const allowedRoles = ['system_admin', 'external_consultant', 'hr_specialist', 'management_coach', 'project_coordinator']
    if (!allowedRoles.includes(userData.user_role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type and size
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'Only ZIP files are supported' }, { status: 400 })
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      return NextResponse.json({ error: 'File size exceeds 100MB limit' }, { status: 400 })
    }

    // Process the SCORM package using static method
    const processingResult = await SCORMPackageManager.uploadPackage(
      file,
      'temp-course-id' // TODO: Replace with actual course ID from request
    )

    if (processingResult.success) {
      return NextResponse.json({
        success: true,
        packageId: processingResult.packageId,
        message: 'SCORM package uploaded and processed successfully'
      }, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        error: processingResult.error || 'Failed to process SCORM package'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('SCORM package upload error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * List SCORM Packages
 * GET /api/scorm/packages/upload
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Validate user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, user_role')
      .eq('id', user.id)
      .single() as { 
        data: { organization_id: string; user_role: Database['public']['Enums']['user_role_type'] } | null;
        error: any 
      }

    if (userError || !userData?.organization_id) {
      return NextResponse.json({ error: 'User organization not found' }, { status: 400 })
    }

    // Get packages for the organization
    const { data: packages, error: packagesError } = await supabase
      .from('scorm_packages')
      .select(`
        *,
        users!scorm_packages_uploaded_by_fkey (
          full_name,
          email
        )
      `)
      .eq('organization_id', userData.organization_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (packagesError) {
      return NextResponse.json(
        { error: 'Failed to fetch packages' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      packages: packages || []
    })

  } catch (error) {
    console.error('SCORM packages list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
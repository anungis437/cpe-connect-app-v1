// Multi-Tenant Organization Management API
// /app/api/tenant/organizations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { 
  getTenantContext, 
  hasPermission, 
  PERMISSIONS,
  createTenant,
  checkOrgLimits 
} from '@/lib/utils/rbac';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is platform admin
    const isPlatformAdmin = await hasPermission(user.id, PERMISSIONS.SYSTEM_ADMIN);

    if (isPlatformAdmin) {
      // Platform admin can see all organizations
      const { data: organizations, error } = await supabase
        .from('organizations')
        .select(`
          *,
          subscription_plan:subscription_plans (*),
          users_count:users(count),
          courses_count:courses(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ organizations });
    } else {
      // Regular users can only see their own organization
      const context = await getTenantContext(user.id);
      
      if (!context) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        organization: context.organization,
        usage: context.usage,
        limits: await checkOrgLimits(context.organization.id)
      });
    }
  } catch (error) {
    console.error('Organizations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only platform admins can create organizations
    const isPlatformAdmin = await hasPermission(user.id, PERMISSIONS.SYSTEM_ADMIN);
    
    if (!isPlatformAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { organization_name, admin_email, admin_name, plan_name = 'starter' } = body;

    if (!organization_name || !admin_email || !admin_name) {
      return NextResponse.json({ 
        error: 'Missing required fields: organization_name, admin_email, admin_name' 
      }, { status: 400 });
    }

    const result = await createTenant(organization_name, admin_email, admin_name, plan_name);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Organization created successfully',
      organization_id: result.organizationId 
    }, { status: 201 });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { organization_id, ...updates } = body;

    if (!organization_id) {
      return NextResponse.json({ error: 'organization_id is required' }, { status: 400 });
    }

    // Check permissions
    const hasOrgUpdatePermission = await hasPermission(user.id, PERMISSIONS.ORGANIZATION_UPDATE);
    const isPlatformAdmin = await hasPermission(user.id, PERMISSIONS.SYSTEM_ADMIN);

    if (!hasOrgUpdatePermission && !isPlatformAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update organization
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', organization_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Organization updated successfully',
      organization: data 
    });
  } catch (error) {
    console.error('Update organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
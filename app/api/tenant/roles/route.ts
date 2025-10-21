// Role and Permission Management API
// /app/api/tenant/roles/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { 
  hasPermission, 
  PERMISSIONS,
  createOrgRole,
  assignRole,
  removeRole
} from '@/lib/utils/rbac';

// GET /api/tenant/roles - List roles and permissions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');
    const includePermissions = searchParams.get('include_permissions') === 'true';

    // Check permissions
    const canViewRoles = await hasPermission(user.id, PERMISSIONS.USERS_READ) ||
                         await hasPermission(user.id, PERMISSIONS.SYSTEM_ADMIN);

    if (!canViewRoles) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get user's organization if not specified
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      targetOrgId = userData?.organization_id;
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Fetch roles
    let rolesQuery = supabase
      .from('roles')
      .select(includePermissions ? `
        *,
        role_permissions!inner (
          permission:permissions (*)
        )
      ` : '*')
      .or(`organization_id.eq.${targetOrgId},is_system_role.eq.true`);

    const { data: roles, error } = await rolesQuery;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If including permissions, also fetch all available permissions
    let allPermissions = null;
    if (includePermissions) {
      const { data: permissions } = await supabase
        .from('permissions')
        .select('*')
        .order('category', { ascending: true });
      
      allPermissions = permissions;
    }

    return NextResponse.json({ 
      roles,
      permissions: allPermissions
    });
  } catch (error) {
    console.error('Roles API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tenant/roles - Create new role
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const canCreateRoles = await hasPermission(user.id, PERMISSIONS.USERS_ASSIGN_ROLES) ||
                           await hasPermission(user.id, PERMISSIONS.SYSTEM_ADMIN);

    if (!canCreateRoles) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      organization_id,
      name, 
      display_name_en, 
      display_name_fr, 
      description_en, 
      description_fr,
      permission_ids 
    } = body;

    if (!name || !display_name_en || !display_name_fr || !permission_ids) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, display_name_en, display_name_fr, permission_ids' 
      }, { status: 400 });
    }

    // Get user's organization if not specified
    let targetOrgId = organization_id;
    if (!targetOrgId) {
      const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      
      targetOrgId = userData?.organization_id;
    }

    if (!targetOrgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const result = await createOrgRole(targetOrgId, {
      name,
      display_name_en,
      display_name_fr,
      description_en,
      description_fr,
      permission_ids
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Role created successfully',
      role_id: result.roleId 
    }, { status: 201 });
  } catch (error) {
    console.error('Create role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
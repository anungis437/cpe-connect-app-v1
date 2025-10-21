// User Role Assignment API
// /app/api/tenant/users/[userId]/roles/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { 
  hasPermission, 
  PERMISSIONS,
  assignRole,
  removeRole
} from '@/lib/utils/rbac';

// GET /api/tenant/users/[userId]/roles - Get user roles
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;

    // Check permissions - users can view their own roles or need users.read permission
    const canViewRoles = user.id === userId || 
                         await hasPermission(user.id, PERMISSIONS.USERS_READ) ||
                         await hasPermission(user.id, PERMISSIONS.SYSTEM_ADMIN);

    if (!canViewRoles) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get user roles with role details
    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        role:roles (
          *,
          role_permissions (
            permission:permissions (*)
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user_roles: userRoles });
  } catch (error) {
    console.error('Get user roles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tenant/users/[userId]/roles - Assign role to user
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;

    // Check permissions
    const canAssignRoles = await hasPermission(user.id, PERMISSIONS.USERS_ASSIGN_ROLES) ||
                           await hasPermission(user.id, PERMISSIONS.SYSTEM_ADMIN);

    if (!canAssignRoles) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { role_id, expires_at } = body;

    if (!role_id) {
      return NextResponse.json({ error: 'role_id is required' }, { status: 400 });
    }

    const expirationDate = expires_at ? new Date(expires_at) : undefined;
    const result = await assignRole(userId, role_id, user.id, expirationDate);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Role assigned successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Assign role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tenant/users/[userId]/roles - Remove role from user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.userId;

    // Check permissions
    const canRemoveRoles = await hasPermission(user.id, PERMISSIONS.USERS_ASSIGN_ROLES) ||
                           await hasPermission(user.id, PERMISSIONS.SYSTEM_ADMIN);

    if (!canRemoveRoles) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('role_id');

    if (!roleId) {
      return NextResponse.json({ error: 'role_id parameter is required' }, { status: 400 });
    }

    const result = await removeRole(userId, roleId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      message: 'Role removed successfully' 
    });
  } catch (error) {
    console.error('Remove role error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
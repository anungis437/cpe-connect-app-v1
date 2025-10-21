// Multi-Tenant RBAC Utility Functions
// Server-side utilities for permission checking and tenant management

// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { 
  EnhancedUser, 
  Permission, 
  Role, 
  TenantContext, 
  PERMISSIONS, 
  SYSTEM_ROLES, 
  ORG_ROLES,
  SubscriptionPlan,
  EnhancedOrganization
} from '@/types/multi-tenant';

// ===========================
// PERMISSION CHECKING
// ===========================

/**
 * Check if a user has a specific permission
 * Can be used on server or client side
 */
export async function hasPermission(
  userId: string, 
  permission: string,
  supabaseClient?: any
): Promise<boolean> {
  const supabase = supabaseClient || createClient();
  
  const { data, error } = await supabase
    .rpc('user_has_permission', {
      user_uuid: userId,
      permission_name: permission
    });
  
  if (error) {
    console.error('Permission check error:', error);
    return false;
  }
  
  return data || false;
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      role:roles!inner (
        role_permissions!inner (
          permission:permissions!inner (name)
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
  
  const permissions = new Set<string>();
  
  data?.forEach((userRole: any) => {
    userRole.role?.role_permissions?.forEach((rp: any) => {
      if (rp.permission?.name) {
        permissions.add(rp.permission.name);
      }
    });
  });
  
  return Array.from(permissions);
}

/**
 * Check if user is organization admin
 */
export async function isOrgAdmin(userId: string, organizationId: string): Promise<boolean> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      role:roles!inner (name)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('roles.organization_id', organizationId)
    .eq('roles.name', ORG_ROLES.ORG_ADMIN);
  
  return !error && data && data.length > 0;
}

/**
 * Check if user is platform admin
 */
export async function isPlatformAdmin(userId: string): Promise<boolean> {
  return await hasPermission(userId, PERMISSIONS.SYSTEM_ADMIN);
}

// ===========================
// TENANT CONTEXT MANAGEMENT
// ===========================

/**
 * Get complete tenant context for a user
 * This is the main function to get user's organization, permissions, etc.
 */
export async function getTenantContext(userId: string): Promise<TenantContext | null> {
  const supabase = createClient();
  
  try {
    // Get user with organization
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations!inner (
          *,
          subscription_plan:subscription_plans (*)
        )
      `)
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      console.error('User fetch error:', userError);
      return null;
    }
    
    // Get user permissions
    const permissions = await getUserPermissions(userId);
    
    // Get current usage
    const { data: usage } = await supabase
      .from('tenant_usage')
      .select('*')
      .eq('organization_id', user.organization_id)
      .eq('period_start', new Date().toISOString().slice(0, 7) + '-01')
      .single();
    
    return {
      organization: user.organization as EnhancedOrganization,
      user: { ...user, permissions } as EnhancedUser,
      subscription: user.organization.subscription_plan as SubscriptionPlan,
      usage: usage || {
        users_count: 0,
        courses_count: 0,
        storage_used_gb: 0,
        api_calls: 0
      },
      permissions,
      isAdmin: await isOrgAdmin(userId, user.organization_id),
      isPlatformAdmin: await isPlatformAdmin(userId)
    };
  } catch (error) {
    console.error('Error getting tenant context:', error);
    return null;
  }
}

// ===========================
// ROLE MANAGEMENT
// ===========================

/**
 * Assign role to user
 */
export async function assignRole(
  userId: string,
  roleId: string,
  assignedBy: string,
  expiresAt?: Date
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: roleId,
      assigned_by: assignedBy,
      expires_at: expiresAt?.toISOString()
    });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

/**
 * Remove role from user
 */
export async function removeRole(
  userId: string,
  roleId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_roles')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('role_id', roleId);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

/**
 * Create custom role for organization
 */
export async function createOrgRole(
  organizationId: string,
  roleData: {
    name: string;
    display_name_en: string;
    display_name_fr: string;
    description_en?: string;
    description_fr?: string;
    permission_ids: string[];
  }
): Promise<{ success: boolean; roleId?: string; error?: string }> {
  const supabase = createClient();
  
  try {
    // Create role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .insert({
        organization_id: organizationId,
        name: roleData.name,
        display_name_en: roleData.display_name_en,
        display_name_fr: roleData.display_name_fr,
        description_en: roleData.description_en,
        description_fr: roleData.description_fr
      })
      .select('id')
      .single();
    
    if (roleError) {
      return { success: false, error: roleError.message };
    }
    
    // Assign permissions
    if (roleData.permission_ids.length > 0) {
      const { error: permissionError } = await supabase
        .from('role_permissions')
        .insert(
          roleData.permission_ids.map(permissionId => ({
            role_id: role.id,
            permission_id: permissionId
          }))
        );
      
      if (permissionError) {
        return { success: false, error: permissionError.message };
      }
    }
    
    return { success: true, roleId: role.id };
  } catch (error) {
    return { success: false, error: 'Failed to create role' };
  }
}

// ===========================
// TENANT MANAGEMENT
// ===========================

/**
 * Create new tenant organization
 */
export async function createTenant(
  orgName: string,
  adminEmail: string,
  adminName: string,
  planName: string = 'starter'
): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .rpc('create_tenant', {
      org_name: orgName,
      admin_email: adminEmail,
      admin_name: adminName,
      plan_name: planName
    });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, organizationId: data };
}

/**
 * Check if organization has reached limits
 */
export async function checkOrgLimits(organizationId: string): Promise<{
  within_limits: boolean;
  limits: {
    users: { current: number; max: number; exceeded: boolean };
    courses: { current: number; max: number; exceeded: boolean };
    storage: { current: number; max: number; exceeded: boolean };
  };
}> {
  const supabase = createClient();
  
  // Get organization with subscription plan
  const { data: org } = await supabase
    .from('organizations')
    .select(`
      *,
      subscription_plan:subscription_plans (*)
    `)
    .eq('id', organizationId)
    .single();
  
  if (!org || !org.subscription_plan) {
    return {
      within_limits: false,
      limits: {
        users: { current: 0, max: 0, exceeded: true },
        courses: { current: 0, max: 0, exceeded: true },
        storage: { current: 0, max: 0, exceeded: true }
      }
    };
  }
  
  // Get current usage
  const { data: usage } = await supabase
    .from('tenant_usage')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('period_start', new Date().toISOString().slice(0, 7) + '-01')
    .single();
  
  const currentUsage = usage || { users_count: 0, courses_count: 0, storage_used_gb: 0 };
  const plan = org.subscription_plan;
  
  const limits = {
    users: {
      current: currentUsage.users_count,
      max: plan.max_users,
      exceeded: currentUsage.users_count >= plan.max_users
    },
    courses: {
      current: currentUsage.courses_count,
      max: plan.max_courses,
      exceeded: currentUsage.courses_count >= plan.max_courses
    },
    storage: {
      current: currentUsage.storage_used_gb,
      max: plan.max_storage_gb,
      exceeded: currentUsage.storage_used_gb >= plan.max_storage_gb
    }
  };
  
  const within_limits = !limits.users.exceeded && !limits.courses.exceeded && !limits.storage.exceeded;
  
  return { within_limits, limits };
}

// ===========================
// MIDDLEWARE HELPERS
// ===========================

/**
 * Middleware helper to check permissions
 * Use in API routes to protect endpoints
 */
export async function requirePermission(
  userId: string,
  permission: string
): Promise<{ authorized: boolean; error?: string }> {
  if (!userId) {
    return { authorized: false, error: 'Authentication required' };
  }
  
  const hasPerms = await hasPermission(userId, permission);
  
  if (!hasPerms) {
    return { authorized: false, error: 'Insufficient permissions' };
  }
  
  return { authorized: true };
}

/**
 * Middleware helper to check organization membership
 */
export async function requireOrgMembership(
  userId: string,
  organizationId: string
): Promise<{ authorized: boolean; error?: string }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .rpc('user_belongs_to_org', {
      user_uuid: userId,
      org_uuid: organizationId
    });
  
  if (error || !data) {
    return { authorized: false, error: 'Organization access denied' };
  }
  
  return { authorized: true };
}

// ===========================
// PERMISSION CONSTANTS EXPORT
// ===========================

export {
  PERMISSIONS,
  SYSTEM_ROLES,
  ORG_ROLES
};
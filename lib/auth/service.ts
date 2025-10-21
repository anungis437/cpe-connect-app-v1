import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserProfile, UserPermissions, TenantContext } from './types'
import { Database } from '@/types/database'

type UserWithRoles = Database['public']['Tables']['users']['Row'] & {
  organization?: Database['public']['Tables']['organizations']['Row']
  user_roles?: Array<{
    role: Database['public']['Tables']['roles']['Row'] & {
      role_permissions?: Array<{
        permission: Database['public']['Tables']['permissions']['Row']
      }>
    }
  }>
}

/**
 * Server-side authentication utilities
 */
export class AuthService {
  private supabase: ReturnType<typeof createServerClient> | null = null
  private adminClient: ReturnType<typeof createAdminClient> | null = null

  private async getServerClient() {
    return await createServerClient()
  }

  private getAdminClient() {
    if (!this.adminClient) {
      this.adminClient = createAdminClient()
    }
    return this.adminClient
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = await this.getServerClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting current user:', error)
        return null
      }
      
      return user
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  /**
   * Get user profile with organization and roles
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = await this.getServerClient()
      
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          organization:organizations(*),
          user_roles:user_roles(
            *,
            role:roles(
              *,
              role_permissions:role_permissions(
                permission:permissions(*)
              )
            )
          )
        `)
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return null
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string, organizationId?: string): Promise<UserPermissions> {
    const profile = await this.getUserProfile(userId)
    
    if (!profile || !profile.user_roles) {
      return this.getDefaultPermissions()
    }

    // Filter roles by organization if specified
    const relevantRoles = profile.user_roles.filter(userRole => 
      !organizationId || 
      userRole.role.is_system_role || 
      userRole.role.organization_id === organizationId
    )

    // Collect all permissions from relevant roles
    const permissions = new Set<string>()
    
    relevantRoles.forEach(userRole => {
      userRole.role.role_permissions?.forEach(rolePermission => {
        permissions.add(rolePermission.permission.name)
      })
    })

    return {
      canManageUsers: permissions.has('users.create') && permissions.has('users.update'),
      canManageOrganization: permissions.has('organization.update'),
      canViewAnalytics: permissions.has('organization.analytics'),
      canManageCourses: permissions.has('courses.create') && permissions.has('courses.update'),
      canIssueCertificates: permissions.has('courses.publish'),
      canViewReports: permissions.has('organization.analytics'),
      isOrgAdmin: relevantRoles.some(ur => ur.role.name === 'org_admin'),
      isSuperAdmin: permissions.has('system.admin')
    }
  }

  /**
   * Get tenant context for multi-tenancy
   */
  async getTenantContext(organizationId: string): Promise<TenantContext | null> {
    try {
      const supabase = await this.getServerClient()
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (error || !data) {
        return null
      }

      const organization = data as Database['public']['Tables']['organizations']['Row']
      
      return {
        organizationId: organization.id,
        organizationSlug: organization.slug || organization.name.toLowerCase().replace(/\s+/g, '-'),
        subscriptionTier: organization.subscription_tier || 'free',
        features: this.getFeaturesByTier(organization.subscription_tier || 'free')
      }
    } catch (error) {
      console.error('Failed to get tenant context:', error)
      return null
    }
  }

  /**
   * Verify user has permission
   */
  async hasPermission(userId: string, permission: string, organizationId?: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, organizationId)
    
    // Map permission strings to permission object properties
    const permissionMap: Record<string, keyof UserPermissions> = {
      'users.create': 'canManageUsers',
      'users.update': 'canManageUsers',
      'organization.update': 'canManageOrganization',
      'organization.analytics': 'canViewAnalytics',
      'courses.create': 'canManageCourses',
      'courses.update': 'canManageCourses',
      'courses.publish': 'canIssueCertificates',
      'system.admin': 'isSuperAdmin'
    }

    const permissionKey = permissionMap[permission]
    return permissionKey ? permissions[permissionKey] : false
  }

  /**
   * Create user with organization
   */
  async createUserWithOrganization(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    organizationName: string,
    organizationSlug: string
  ) {
    try {
      const adminClient = this.getAdminClient()
      
      // Create auth user
      const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

      if (authError || !authUser.user) {
        throw new Error(`Failed to create auth user: ${authError?.message}`)
      }

      // Create organization
      const { data: organization, error: orgError } = await adminClient
        .from('organizations')
        .insert({
          name: organizationName,
          slug: organizationSlug,
          type: 'enterprise'
        } as any)
        .select()
        .single()

      if (orgError || !organization) {
        // Clean up auth user if organization creation fails
        await adminClient.auth.admin.deleteUser(authUser.user.id)
        throw new Error(`Failed to create organization: ${orgError?.message}`)
      }

      // Create user profile
      const { error: profileError } = await adminClient
        .from('users')
        .insert({
          id: authUser.user.id,
          email,
          full_name: `${firstName} ${lastName}`,
          organization_id: (organization as any).id
        } as any)

      if (profileError) {
        // Clean up auth user and organization
        await adminClient.auth.admin.deleteUser(authUser.user.id)
        await adminClient.from('organizations').delete().eq('id', (organization as any).id)
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      // Assign organization admin role
      const { data: orgAdminRole } = await adminClient
        .from('roles')
        .select('id')
        .eq('name', 'org_admin')
        .eq('organization_id', (organization as any).id)
        .single()

      if (orgAdminRole) {
        await adminClient
          .from('user_roles')
          .insert({
            user_id: authUser.user.id,
            role_id: (orgAdminRole as any).id,
            organization_id: (organization as any).id
          } as any)
      }

      return {
        user: authUser.user,
        organization,
        success: true
      }
    } catch (error) {
      console.error('Failed to create user with organization:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private getDefaultPermissions(): UserPermissions {
    return {
      canManageUsers: false,
      canManageOrganization: false,
      canViewAnalytics: false,
      canManageCourses: false,
      canIssueCertificates: false,
      canViewReports: false,
      isOrgAdmin: false,
      isSuperAdmin: false
    }
  }

  private getFeaturesByTier(tier: 'free' | 'pro' | 'enterprise'): string[] {
    const features = {
      free: ['basic_courses', 'basic_reports'],
      pro: ['basic_courses', 'basic_reports', 'advanced_analytics', 'custom_branding'],
      enterprise: ['basic_courses', 'basic_reports', 'advanced_analytics', 'custom_branding', 'sso', 'api_access', 'priority_support']
    }
    
    return features[tier] || features.free
  }
}

/**
 * Client-side authentication utilities
 */
export class ClientAuthService {
  private supabase = createClient()

  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string, rememberMe: boolean = false) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithPassword(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    organizationName?: string
  ) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            organization_name: organizationName
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(provider: 'google' | 'azure' | 'linkedin') {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as any, // Type assertion for custom providers
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'OAuth sign in failed' 
      }
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      }
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string, redirectTo?: string) {
    try {
      const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password reset failed' 
      }
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Password update failed' 
      }
    }
  }
}

// Export singleton instances
export const authService = new AuthService()
export const clientAuthService = new ClientAuthService()
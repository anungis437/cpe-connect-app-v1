'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, UserPermissions, TenantContext, AuthState } from './types'

interface AuthContextType extends AuthState {
  permissions: UserPermissions | null
  tenantContext: TenantContext | null
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false
  })
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [tenantContext, setTenantContext] = useState<TenantContext | null>(null)

  const supabase = createClient()

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId as any)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      const userData = data as any

      // Fetch organization separately if needed
      let organization = null
      if (userData?.organization_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', userData.organization_id as any)
          .single()
        organization = orgData as any
      }

      // Fetch user roles separately
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId as any)

      return {
        ...userData,
        organization,
        user_roles: userRoles || []
      } as UserProfile
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return null
    }
  }, [supabase])

  const calculatePermissions = useCallback((profile: UserProfile): UserPermissions => {
    // CPE role-based permissions
    const role = profile.user_role
    const isSystemAdmin = role === 'system_admin'
    const isExternalConsultant = role === 'external_consultant'
    const isHRSpecialist = role === 'hr_specialist'
    const isProjectCoordinator = role === 'project_coordinator'
    const isCommitteeChair = role === 'committee_chair'
    const isMinistryPersonnel = role === 'ministry_personnel'

    return {
      canManageUsers: isSystemAdmin || isProjectCoordinator || isMinistryPersonnel,
      canManageOrganization: isSystemAdmin || isProjectCoordinator,
      canViewAnalytics: isSystemAdmin || isProjectCoordinator || isMinistryPersonnel || isHRSpecialist,
      canManageCourses: isSystemAdmin || isExternalConsultant || isHRSpecialist,
      canIssueCertificates: isSystemAdmin || isExternalConsultant || isHRSpecialist,
      canViewReports: isSystemAdmin || isProjectCoordinator || isMinistryPersonnel || isHRSpecialist,
      isOrgAdmin: isProjectCoordinator || isCommitteeChair,
      isSuperAdmin: isSystemAdmin
    }
  }, [])

  const fetchTenantContext = useCallback(async (organizationId: string): Promise<TenantContext | null> => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId as any)
        .single()

      if (error || !data) {
        return null
      }

      const organization = data as any

      return {
        organizationId: organization.id,
        organizationSlug: organization.slug || organization.name.toLowerCase().replace(/\\s+/g, '-'),
        subscriptionTier: organization.subscription_tier || 'free',
        features: getFeaturesByTier(organization.subscription_tier || 'free')
      }
    } catch (error) {
      console.error('Failed to fetch tenant context:', error)
      return null
    }
  }, [supabase])

  const refreshProfile = async () => {
    if (!authState.user) return

    const profile = await fetchUserProfile(authState.user.id)
    
    if (profile) {
      const userPermissions = calculatePermissions(profile)
      setPermissions(userPermissions)

      if (profile.organization_id) {
        const context = await fetchTenantContext(profile.organization_id)
        setTenantContext(context)
      }

      setAuthState(prev => ({
        ...prev,
        profile
      }))
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const profile = await fetchUserProfile(session.user.id)
            
            if (!mounted) return

            let userPermissions: UserPermissions = getDefaultPermissions()
            let context: TenantContext | null = null

            if (profile) {
              userPermissions = calculatePermissions(profile)
              
              if (profile.organization_id) {
                context = await fetchTenantContext(profile.organization_id)
              }
            }

            if (mounted) {
              setAuthState({
                user: session.user,
                profile,
                session,
                isLoading: false,
                isAuthenticated: true
              })
              setPermissions(userPermissions)
              setTenantContext(context)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setAuthState({
              user: null,
              profile: null,
              session: null,
              isLoading: false,
              isAuthenticated: false
            })
            setPermissions(null)
            setTenantContext(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, fetchTenantContext, calculatePermissions, supabase.auth])

  const value: AuthContextType = {
    ...authState,
    permissions,
    tenantContext,
    signIn,
    signUp,
    signOut,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Custom hooks for specific auth states
export function useUser() {
  const { user } = useAuth()
  return user
}

export function useProfile() {
  const { profile } = useAuth()
  return profile
}

export function usePermissions() {
  const { permissions } = useAuth()
  return permissions
}

export function useTenant() {
  const { tenantContext } = useAuth()
  return tenantContext
}

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

// Permission checker hook
export function useHasPermission(permission: keyof UserPermissions) {
  const { permissions } = useAuth()
  return permissions?.[permission] ?? false
}

// Role checker hooks
export function useIsOrgAdmin() {
  return useHasPermission('isOrgAdmin')
}

export function useIsSuperAdmin() {
  return useHasPermission('isSuperAdmin')
}

// Helper functions
function getDefaultPermissions(): UserPermissions {
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

function getFeaturesByTier(tier: 'free' | 'pro' | 'enterprise'): string[] {
  const features = {
    free: ['basic_courses', 'basic_reports'],
    pro: ['basic_courses', 'basic_reports', 'advanced_analytics', 'custom_branding'],
    enterprise: ['basic_courses', 'basic_reports', 'advanced_analytics', 'custom_branding', 'sso', 'api_access', 'priority_support']
  }
  
  return features[tier] || features.free
}
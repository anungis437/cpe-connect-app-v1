import { User, Session } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Enhanced user profile type with organization and role information (CPE schema)
export type UserProfile = Database['public']['Tables']['users']['Row'] & {
  organization?: Database['public']['Tables']['organizations']['Row']
}

// Authentication state types
export interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Multi-tenant context
export interface TenantContext {
  organizationId: string
  organizationSlug: string
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  features: string[]
}

// Role-based permissions
export interface UserPermissions {
  canManageUsers: boolean
  canManageOrganization: boolean
  canViewAnalytics: boolean
  canManageCourses: boolean
  canIssueCertificates: boolean
  canViewReports: boolean
  isOrgAdmin: boolean
  isSuperAdmin: boolean
}

// OAuth provider configuration
export interface OAuthProvider {
  id: 'google' | 'microsoft' | 'linkedin'
  name: string
  enabled: boolean
  scopes?: string[]
}

// Authentication error types
export interface AuthError {
  code: string
  message: string
  details?: any
}

// Session management
export interface SessionConfig {
  maxAge: number
  refreshTokenRotation: boolean
  sessionTimeout: number
  rememberMe: boolean
}

// Registration data
export interface RegistrationData {
  email: string
  password: string
  firstName: string
  lastName: string
  organizationName?: string
  organizationSlug?: string
  inviteCode?: string
  acceptTerms: boolean
  subscribeNewsletter?: boolean
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

// Password reset request
export interface PasswordResetRequest {
  email: string
  redirectTo?: string
}

// Profile update data
export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  phone?: string
  timezone?: string
  language?: string
  avatarUrl?: string
  preferences?: Record<string, any>
}

// Organization invitation
export interface OrganizationInvitation {
  email: string
  roleId: string
  expiresAt?: string
  message?: string
}

// Two-factor authentication
export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

// Audit log entry
export interface AuditLogEntry {
  id: string
  userId: string
  organizationId: string
  action: string
  resourceType: string
  resourceId: string
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: string
}

// Organization settings
export interface OrganizationSettings {
  allowSelfRegistration: boolean
  requiredEmailDomains: string[]
  enableSSO: boolean
  ssoProvider?: string
  enableTwoFactor: boolean
  sessionTimeout: number
  passwordPolicy: PasswordPolicy
}

// Password policy
export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventReuse: number
  maxAge: number
}

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: AuthError
  message?: string
}
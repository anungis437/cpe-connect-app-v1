// Enhanced Multi-Tenant SaaS Types
// Supporting the enterprise-grade multi-tenancy and RBAC system

import { Database } from './database';

// Base types from database
type Organization = Database['public']['Tables']['organizations']['Row'];
type User = Database['public']['Tables']['users']['Row'];
type Course = Database['public']['Tables']['courses']['Row'];

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name_en: string;
  display_name_fr: string;
  max_users: number;
  max_courses: number;
  max_storage_gb: number;
  price_monthly: number;
  price_yearly?: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnhancedOrganization extends Omit<Organization, 'subscription_status'> {
  subscription_plan_id?: string;
  subscription_status?: 'trial' | 'active' | 'suspended' | 'cancelled' | 'past_due';
  subscription_start_date?: string;
  subscription_end_date?: string;
  billing_email?: string;
  stripe_customer_id?: string;
  domain?: string;
  settings: Record<string, any>;
  is_active: boolean;
  subscription_plan?: SubscriptionPlan;
}

export interface TenantUsage {
  id: string;
  organization_id: string;
  period_start: string;
  period_end: string;
  users_count: number;
  courses_count: number;
  storage_used_gb: number;
  api_calls: number;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name_en: string;
  display_name_fr: string;
  category: 'user' | 'course' | 'organization' | 'system';
  description_en?: string;
  description_fr?: string;
  created_at: string;
}

export interface Role {
  id: string;
  organization_id?: string; // null for platform-wide roles
  name: string;
  display_name_en: string;
  display_name_fr: string;
  description_en?: string;
  description_fr?: string;
  is_system_role: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_by?: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  role?: Role;
}

export interface EnhancedUser extends User {
  user_roles?: UserRole[];
  permissions?: Permission[];
}

export interface TenantRegistration {
  id: string;
  organization_name: string;
  admin_email: string;
  admin_name: string;
  industry?: string;
  company_size?: string;
  requested_plan?: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata: Record<string, any>;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
}

// Permission constants for type safety
export const PERMISSIONS = {
  // User Management
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_ASSIGN_ROLES: 'users.assign_roles',
  
  // Course Management
  COURSES_CREATE: 'courses.create',
  COURSES_READ: 'courses.read',
  COURSES_UPDATE: 'courses.update',
  COURSES_DELETE: 'courses.delete',
  COURSES_PUBLISH: 'courses.publish',
  COURSES_ENROLL_USERS: 'courses.enroll_users',
  
  // Organization Management
  ORGANIZATION_READ: 'organization.read',
  ORGANIZATION_UPDATE: 'organization.update',
  ORGANIZATION_BILLING: 'organization.billing',
  ORGANIZATION_ANALYTICS: 'organization.analytics',
  
  // System Permissions
  SYSTEM_ADMIN: 'system.admin',
  API_ACCESS: 'api.access',
} as const;

// Role constants
export const SYSTEM_ROLES = {
  PLATFORM_ADMIN: 'platform_admin',
  PLATFORM_SUPPORT: 'platform_support',
} as const;

export const ORG_ROLES = {
  ORG_ADMIN: 'org_admin',
  INSTRUCTOR: 'instructor',
  LEARNER: 'learner',
} as const;

// Subscription status types
export type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'cancelled';

// Permission check utility type
export type PermissionCheck = keyof typeof PERMISSIONS;

// Tenant context for frontend state management
export interface TenantContext {
  organization: EnhancedOrganization;
  user: EnhancedUser;
  subscription: SubscriptionPlan;
  usage: TenantUsage;
  permissions: string[];
  isAdmin: boolean;
  isPlatformAdmin: boolean;
}

// API response types
export interface TenantSetupResponse {
  organization_id: string;
  admin_user_id: string;
  default_roles: Role[];
  subscription_plan: SubscriptionPlan;
}

export interface PermissionCheckResponse {
  has_permission: boolean;
  reason?: string;
}

// Utility interfaces for forms and management
export interface CreateTenantRequest {
  organization_name: string;
  admin_email: string;
  admin_name: string;
  plan_name?: string;
  industry?: string;
  company_size?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  billing_email?: string;
  domain?: string;
  settings?: Record<string, any>;
}

export interface AssignRoleRequest {
  user_id: string;
  role_id: string;
  expires_at?: string;
}

export interface CreateRoleRequest {
  name: string;
  display_name_en: string;
  display_name_fr: string;
  description_en?: string;
  description_fr?: string;
  permission_ids: string[];
}

// Billing and subscription management
export interface BillingInfo {
  subscription_plan: SubscriptionPlan;
  current_usage: TenantUsage;
  billing_history: BillingEvent[];
  next_billing_date?: string;
  amount_due?: number;
}

export interface BillingEvent {
  id: string;
  organization_id: string;
  event_type: 'subscription_created' | 'subscription_updated' | 'payment_succeeded' | 'payment_failed' | 'trial_ended';
  amount?: number;
  currency?: string;
  stripe_invoice_id?: string;
  created_at: string;
}

// Analytics and reporting
export interface TenantAnalytics {
  user_growth: {
    period: string;
    active_users: number;
    new_users: number;
  }[];
  course_engagement: {
    course_id: string;
    course_title: string;
    enrollment_count: number;
    completion_rate: number;
  }[];
  usage_trends: {
    period: string;
    storage_used: number;
    api_calls: number;
  }[];
}

// Enhanced course type with organization context
export interface EnhancedCourse extends Course {
  organization_id: string;
  organization?: EnhancedOrganization;
  can_edit: boolean;
  can_delete: boolean;
  can_publish: boolean;
}
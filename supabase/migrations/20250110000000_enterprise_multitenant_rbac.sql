-- Enterprise Multi-Tenant SaaS Enhancement with Advanced RBAC
-- This migration enhances the existing schema for enterprise-grade multi-tenancy

-- ===========================
-- TENANT MANAGEMENT SYSTEM
-- ===========================

-- Subscription plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name_en TEXT NOT NULL,
  display_name_fr TEXT NOT NULL,
  max_users INTEGER NOT NULL,
  max_courses INTEGER NOT NULL,
  max_storage_gb INTEGER NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name_en, display_name_fr, max_users, max_courses, max_storage_gb, price_monthly, price_yearly, features) VALUES
('starter', 'Starter Plan', 'Plan Débutant', 25, 10, 5, 29.99, 299.99, '["basic_analytics", "email_support"]'),
('professional', 'Professional Plan', 'Plan Professionnel', 100, 50, 25, 99.99, 999.99, '["advanced_analytics", "priority_support", "custom_branding", "api_access"]'),
('enterprise', 'Enterprise Plan', 'Plan Entreprise', 1000, 200, 100, 299.99, 2999.99, '["unlimited_analytics", "dedicated_support", "white_label", "sso", "advanced_api"]');

-- Tenant subscriptions table (enhance organizations)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES subscription_plans(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'suspended', 'cancelled'));
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS domain TEXT; -- For SSO and branding
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Usage tracking table
CREATE TABLE tenant_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  users_count INTEGER DEFAULT 0,
  courses_count INTEGER DEFAULT 0,
  storage_used_gb DECIMAL(10,2) DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, period_start)
);

-- ===========================
-- ADVANCED RBAC SYSTEM
-- ===========================

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name_en TEXT NOT NULL,
  display_name_fr TEXT NOT NULL,
  category TEXT NOT NULL, -- 'user', 'course', 'organization', 'system'
  description_en TEXT,
  description_fr TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert comprehensive permissions
INSERT INTO permissions (name, display_name_en, display_name_fr, category, description_en, description_fr) VALUES
-- User Management Permissions
('users.create', 'Create Users', 'Créer des Utilisateurs', 'user', 'Create new users in organization', 'Créer de nouveaux utilisateurs dans l''organisation'),
('users.read', 'View Users', 'Voir les Utilisateurs', 'user', 'View user profiles and data', 'Voir les profils et données des utilisateurs'),
('users.update', 'Edit Users', 'Modifier les Utilisateurs', 'user', 'Edit user profiles and settings', 'Modifier les profils et paramètres des utilisateurs'),
('users.delete', 'Delete Users', 'Supprimer les Utilisateurs', 'user', 'Remove users from organization', 'Supprimer des utilisateurs de l''organisation'),
('users.assign_roles', 'Assign Roles', 'Assigner des Rôles', 'user', 'Assign and modify user roles', 'Assigner et modifier les rôles des utilisateurs'),

-- Course Management Permissions
('courses.create', 'Create Courses', 'Créer des Cours', 'course', 'Create new courses', 'Créer de nouveaux cours'),
('courses.read', 'View Courses', 'Voir les Cours', 'course', 'View course content and data', 'Voir le contenu et les données des cours'),
('courses.update', 'Edit Courses', 'Modifier les Cours', 'course', 'Edit course content and settings', 'Modifier le contenu et les paramètres des cours'),
('courses.delete', 'Delete Courses', 'Supprimer les Cours', 'course', 'Remove courses from system', 'Supprimer des cours du système'),
('courses.publish', 'Publish Courses', 'Publier des Cours', 'course', 'Publish and unpublish courses', 'Publier et dépublier des cours'),
('courses.enroll_users', 'Enroll Users', 'Inscrire des Utilisateurs', 'course', 'Enroll users in courses', 'Inscrire des utilisateurs aux cours'),

-- Organization Management Permissions
('organization.read', 'View Organization', 'Voir l''Organisation', 'organization', 'View organization details', 'Voir les détails de l''organisation'),
('organization.update', 'Edit Organization', 'Modifier l''Organisation', 'organization', 'Edit organization settings', 'Modifier les paramètres de l''organisation'),
('organization.billing', 'Manage Billing', 'Gérer la Facturation', 'organization', 'Access billing and subscription', 'Accéder à la facturation et aux abonnements'),
('organization.analytics', 'View Analytics', 'Voir les Analyses', 'organization', 'Access organization analytics', 'Accéder aux analyses de l''organisation'),

-- System Permissions
('system.admin', 'System Admin', 'Admin Système', 'system', 'Full system administration', 'Administration complète du système'),
('api.access', 'API Access', 'Accès API', 'system', 'Access to API endpoints', 'Accès aux points de terminaison API');

-- Roles table (enhanced)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for platform-wide roles
  name TEXT NOT NULL,
  display_name_en TEXT NOT NULL,
  display_name_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  is_system_role BOOLEAN DEFAULT false, -- Platform-wide roles
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Insert system-wide roles
INSERT INTO roles (name, display_name_en, display_name_fr, description_en, description_fr, is_system_role, organization_id) VALUES
('platform_admin', 'Platform Administrator', 'Administrateur de Plateforme', 'Full platform access across all tenants', 'Accès complet à la plateforme pour tous les locataires', true, NULL),
('platform_support', 'Platform Support', 'Support de Plateforme', 'Support access to assist tenants', 'Accès support pour aider les locataires', true, NULL);

-- Role permissions junction table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- User roles junction table (replace simple role field)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- ===========================
-- TENANT ISOLATION ENHANCEMENT
-- ===========================

-- Function to check if user belongs to organization
CREATE OR REPLACE FUNCTION user_belongs_to_org(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_uuid 
    AND organization_id = org_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    JOIN role_permissions rp ON rp.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE u.id = user_uuid 
    AND p.name = permission_name
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user organization
CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================
-- ENHANCED RLS POLICIES
-- ===========================

-- Drop existing policies that don't enforce tenant boundaries
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
DROP POLICY IF EXISTS "Admins can manage all modules" ON modules;
DROP POLICY IF EXISTS "Admins can manage all quizzes" ON quizzes;
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;

-- Enhanced RLS policies with strict tenant isolation

-- Organizations - only platform admins and own org members
CREATE POLICY "Platform admins can view all organizations"
  ON organizations FOR SELECT
  USING (
    user_has_permission(auth.uid(), 'system.admin')
  );

CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id = get_user_organization()
  );

CREATE POLICY "Organization admins can update their organization"
  ON organizations FOR UPDATE
  USING (
    id = get_user_organization() 
    AND user_has_permission(auth.uid(), 'organization.update')
  );

-- Users - strict tenant isolation
CREATE POLICY "Users can view users in same organization"
  ON users FOR SELECT
  USING (
    organization_id = get_user_organization()
    AND user_has_permission(auth.uid(), 'users.read')
  );

CREATE POLICY "Users can update users in same organization"
  ON users FOR UPDATE
  USING (
    organization_id = get_user_organization()
    AND user_has_permission(auth.uid(), 'users.update')
  );

-- Courses - organization-scoped with proper permissions
CREATE POLICY "Users can view courses in their organization"
  ON courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = courses.organization_id
    ) OR user_has_permission(auth.uid(), 'system.admin')
  );

-- Add organization_id to courses table for tenant isolation
ALTER TABLE courses ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_courses_organization_id ON courses(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);

-- ===========================
-- TENANT ONBOARDING SYSTEM
-- ===========================

-- Tenant registration requests table
CREATE TABLE tenant_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_name TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  requested_plan TEXT REFERENCES subscription_plans(name),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES users(id)
);

-- Function to create new tenant with default setup
CREATE OR REPLACE FUNCTION create_tenant(
  org_name TEXT,
  admin_email TEXT,
  admin_name TEXT,
  plan_name TEXT DEFAULT 'starter'
)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
  new_user_id UUID;
  admin_role_id UUID;
  plan_id UUID;
BEGIN
  -- Get subscription plan
  SELECT id INTO plan_id FROM subscription_plans WHERE name = plan_name;
  
  -- Create organization
  INSERT INTO organizations (name, subscription_plan_id, subscription_status, subscription_start_date)
  VALUES (org_name, plan_id, 'trial', NOW())
  RETURNING id INTO new_org_id;
  
  -- Create default roles for the organization
  INSERT INTO roles (organization_id, name, display_name_en, display_name_fr, description_en, description_fr, is_default)
  VALUES 
    (new_org_id, 'org_admin', 'Organization Admin', 'Administrateur d''Organisation', 'Full access to organization', 'Accès complet à l''organisation', false),
    (new_org_id, 'instructor', 'Instructor', 'Instructeur', 'Can create and manage courses', 'Peut créer et gérer des cours', false),
    (new_org_id, 'learner', 'Learner', 'Apprenant', 'Can enroll and take courses', 'Peut s''inscrire et suivre des cours', true);
  
  -- Get admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE organization_id = new_org_id AND name = 'org_admin';
  
  -- Assign permissions to roles (simplified for demo)
  INSERT INTO role_permissions (role_id, permission_id)
  SELECT admin_role_id, p.id FROM permissions p WHERE p.category != 'system';
  
  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================
-- TRIGGERS AND FUNCTIONS
-- ===========================

-- Update triggers for new tables
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically track tenant usage
CREATE OR REPLACE FUNCTION update_tenant_usage()
RETURNS void AS $$
DECLARE
  org_record RECORD;
  current_period_start DATE;
  current_period_end DATE;
BEGIN
  current_period_start := date_trunc('month', CURRENT_DATE);
  current_period_end := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::date;
  
  FOR org_record IN SELECT id FROM organizations WHERE is_active = true LOOP
    INSERT INTO tenant_usage (organization_id, period_start, period_end, users_count, courses_count)
    VALUES (
      org_record.id,
      current_period_start,
      current_period_end,
      (SELECT COUNT(*) FROM users WHERE organization_id = org_record.id),
      (SELECT COUNT(*) FROM courses WHERE organization_id = org_record.id)
    )
    ON CONFLICT (organization_id, period_start) 
    DO UPDATE SET
      users_count = EXCLUDED.users_count,
      courses_count = EXCLUDED.courses_count;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_registrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for new tables
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Platform admins can view all tenant usage"
  ON tenant_usage FOR SELECT
  USING (user_has_permission(auth.uid(), 'system.admin'));

CREATE POLICY "Organization admins can view their tenant usage"
  ON tenant_usage FOR SELECT
  USING (
    organization_id = get_user_organization()
    AND user_has_permission(auth.uid(), 'organization.analytics')
  );

CREATE POLICY "Users can view permissions"
  ON permissions FOR SELECT
  USING (true);

CREATE POLICY "Users can view roles in their organization"
  ON roles FOR SELECT
  USING (
    organization_id = get_user_organization() 
    OR is_system_role = true
    OR user_has_permission(auth.uid(), 'system.admin')
  );

COMMENT ON TABLE organizations IS 'Multi-tenant organizations with subscription management';
COMMENT ON TABLE subscription_plans IS 'SaaS subscription tiers with feature limits';
COMMENT ON TABLE tenant_usage IS 'Usage tracking for billing and quota enforcement';
COMMENT ON TABLE permissions IS 'Granular permissions for RBAC system';
COMMENT ON TABLE roles IS 'Roles scoped to organizations or platform-wide';
COMMENT ON TABLE role_permissions IS 'Many-to-many relationship between roles and permissions';
COMMENT ON TABLE user_roles IS 'User role assignments with expiration support';
COMMENT ON TABLE tenant_registrations IS 'Self-service tenant onboarding requests';
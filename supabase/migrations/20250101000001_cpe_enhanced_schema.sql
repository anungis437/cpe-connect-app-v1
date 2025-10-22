-- CPE Connect LMS Database Schema - Enhanced for CPE Program Structure
-- Based on analysis of 00_CPE_generalites.pdf

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for CPE structure
CREATE TYPE intervention_category AS ENUM (
  'enterprise_interventions',
  'partnership_interventions', 
  'sectoral_interventions'
);

CREATE TYPE enterprise_intervention_type AS ENUM (
  'coaching_management_development',
  'recruitment_support',
  'hr_management_support', 
  'employment_stabilization',
  'work_time_arrangements_artt',
  'reclassification_committee'
);

CREATE TYPE partnership_intervention_type AS ENUM (
  'ad_hoc_consultation_tables',
  'active_measure_support',
  'other_consultation_projects'
);

CREATE TYPE sectoral_intervention_type AS ENUM (
  'sectoral_workforce_committees',
  'advisory_committees'
);

CREATE TYPE user_role_type AS ENUM (
  -- External service providers
  'external_consultant',
  'hr_specialist',
  'management_coach', 
  'facilitation_expert',
  -- Internal coordinators
  'project_coordinator',
  'hr_coordinator',
  'committee_animator',
  -- Organization representatives
  'enterprise_representative',
  'worker_representative',
  'employer_representative',
  -- Government oversight
  'ministry_personnel',
  'sector_advisor',
  -- Committee members
  'committee_member',
  'committee_chair',
  -- System admin
  'system_admin'
);

CREATE TYPE organization_type AS ENUM (
  'sme_6_99_employees',
  'private_enterprise',
  'worker_association',
  'employer_association', 
  'professional_association',
  'non_profit_organization',
  'cooperative',
  'independent_worker',
  'employer_group',
  'worker_group',
  'training_establishment',
  'municipal_administration',
  'band_council',
  'municipal_admin_own_hr',
  'parapublic_provincial',
  'parapublic_federal',
  'private_training_own_hr',
  'health_social_services_own_hr',
  'band_council_own_hr'
);

CREATE TYPE economic_sector AS ENUM (
  'manufacturing',
  'construction',
  'transportation',
  'information_technology',
  'healthcare_social_services',
  'education_training',
  'retail_commerce',
  'hospitality_tourism',
  'agriculture_forestry',
  'mining_extraction',
  'financial_services',
  'professional_services',
  'arts_culture_recreation',
  'public_administration',
  'utilities',
  'real_estate',
  'waste_management',
  'telecommunications',
  'biotechnology',
  'aerospace',
  'textile_clothing',
  'food_processing',
  'chemicals_plastics',
  'metal_transformation',
  'wood_paper',
  'printing_publishing',
  'maritime',
  'community_social_economy',
  'green_economy'
);

CREATE TYPE priority_funding_sector AS ENUM (
  'digital_transformation_productivity',
  'experienced_workers',
  'community_sector',
  'information_technology',
  'green_economy_plan'
);

CREATE TYPE project_status AS ENUM (
  'planning',
  'active', 
  'paused',
  'completed',
  'cancelled'
);

CREATE TYPE committee_type AS ENUM (
  'enterprise',
  'sectoral',
  'ad_hoc',
  'advisory'
);

-- Organizations table (enhanced for CPE)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_fr TEXT,
  organization_type organization_type NOT NULL,
  neq_number TEXT UNIQUE, -- Quebec Enterprise Number (required)
  sector economic_sector NOT NULL,
  employee_count INTEGER,
  is_priority_sme BOOLEAN DEFAULT false, -- 6-99 employees priority
  address JSONB,
  contact_info JSONB,
  eligibility_status TEXT DEFAULT 'pending' CHECK (eligibility_status IN ('pending', 'approved', 'rejected', 'suspended')),
  eligibility_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (enhanced for CPE roles)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  user_role user_role_type NOT NULL DEFAULT 'committee_member',
  preferred_locale TEXT NOT NULL DEFAULT 'fr' CHECK (preferred_locale IN ('en', 'fr')), -- French primary
  specializations TEXT[], -- Areas of expertise
  certifications JSONB, -- Professional certifications
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2), -- For consultants
  availability JSONB, -- Schedule availability
  profile_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultation Committees table
CREATE TABLE consultation_committees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_fr TEXT,
  committee_type committee_type NOT NULL,
  sector economic_sector,
  organization_id UUID REFERENCES organizations(id),
  chairperson_id UUID REFERENCES users(id),
  objectives TEXT[],
  objectives_fr TEXT[],
  mandate_start_date DATE NOT NULL,
  mandate_end_date DATE,
  meeting_frequency TEXT CHECK (meeting_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'ad_hoc')),
  next_meeting TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'completed')),
  deliverables JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Committee Members table
CREATE TABLE committee_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  committee_id UUID REFERENCES consultation_committees(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_in_committee user_role_type NOT NULL,
  organization_name TEXT, -- If different from user's main org
  joined_date DATE DEFAULT CURRENT_DATE,
  left_date DATE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(committee_id, user_id)
);

-- CPE Projects table 
CREATE TABLE cpe_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_fr TEXT,
  description TEXT,
  description_fr TEXT,
  category intervention_category NOT NULL,
  enterprise_intervention_type enterprise_intervention_type,
  partnership_intervention_type partnership_intervention_type,
  sectoral_intervention_type sectoral_intervention_type,
  
  -- Organization details
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  sector economic_sector NOT NULL,
  
  -- Financial information
  total_budget DECIMAL(12,2) NOT NULL,
  ministry_contribution DECIMAL(12,2) NOT NULL,
  funding_rate INTEGER CHECK (funding_rate IN (50, 75)), -- Percentage
  priority_sector priority_funding_sector,
  
  -- Timeline
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months <= 12), -- Max 12 initially
  extension_count INTEGER DEFAULT 0 CHECK (extension_count <= 2), -- Max 3 years total
  
  -- Team
  project_coordinator_id UUID REFERENCES users(id),
  committee_id UUID REFERENCES consultation_committees(id),
  
  -- Status & Progress
  status project_status DEFAULT 'planning',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  objectives JSONB,
  deliverables JSONB,
  outcomes JSONB,
  
  -- Compliance & Reporting
  reporting_frequency TEXT CHECK (reporting_frequency IN ('monthly', 'quarterly', 'final')),
  last_report_date DATE,
  next_report_due DATE,
  compliance_status TEXT DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'warning', 'non_compliant')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Consultants (many-to-many)
CREATE TABLE project_consultants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES cpe_projects(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_description TEXT,
  hourly_rate DECIMAL(10,2),
  total_hours_allocated INTEGER,
  hours_completed INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  UNIQUE(project_id, consultant_id)
);

-- Courses table (enhanced for CPE content structure)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  
  -- CPE Classification
  category intervention_category NOT NULL,
  enterprise_intervention_type enterprise_intervention_type,
  partnership_intervention_type partnership_intervention_type, 
  sectoral_intervention_type sectoral_intervention_type,
  target_sector economic_sector,
  
  -- Course details
  duration_hours INTEGER NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  prerequisites TEXT[],
  learning_objectives_en TEXT[],
  learning_objectives_fr TEXT[],
  competencies TEXT[],
  
  -- Roles & Targeting
  target_roles user_role_type[],
  
  -- Assessment & Certification
  assessment_type TEXT CHECK (assessment_type IN ('diagnostic', 'formative', 'certification', 'practical')),
  has_certification BOOLEAN DEFAULT false,
  certification_pathway_id UUID,
  
  -- CPE Program Integration
  funding_eligible BOOLEAN DEFAULT true,
  priority_funding priority_funding_sector,
  consultation_required BOOLEAN DEFAULT false, -- Committee involvement needed
  collaboration_tools TEXT[], -- Tools needed for committee work
  
  -- Content management
  created_by UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'bilingual' CHECK (language IN ('fr', 'en', 'bilingual')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  
  -- Content
  content_en TEXT,
  content_fr TEXT,
  video_url TEXT,
  resources JSONB, -- Documents, links, etc.
  
  -- Interactive elements
  has_quiz BOOLEAN DEFAULT false,
  has_practical_exercise BOOLEAN DEFAULT false,
  collaboration_activity JSONB, -- Committee exercises
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Tools table
CREATE TABLE assessment_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  tool_type TEXT CHECK (tool_type IN ('hr_diagnostic', 'skills_gap', 'productivity_analysis', 'organizational_assessment')),
  category intervention_category NOT NULL,
  target_roles user_role_type[],
  
  -- Assessment configuration
  questions JSONB NOT NULL, -- Question structure
  scoring_criteria JSONB NOT NULL,
  report_template TEXT,
  recommendation_rules JSONB, -- Recommendation engine
  
  -- Usage
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Results table
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_tool_id UUID REFERENCES assessment_tools(id),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES cpe_projects(id),
  
  -- Results
  responses JSONB NOT NULL,
  scores JSONB NOT NULL,
  recommendations JSONB,
  report_data JSONB,
  
  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certification Pathways table
CREATE TABLE certification_pathways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  category intervention_category NOT NULL,
  target_role user_role_type NOT NULL,
  
  -- Requirements
  prerequisites TEXT[],
  required_courses UUID[],
  optional_courses UUID[],
  required_assessments UUID[],
  minimum_experience_months INTEGER,
  
  -- Certification details
  validity_period_months INTEGER NOT NULL,
  renewal_requirements TEXT[],
  issuing_authority TEXT NOT NULL,
  recognized_by TEXT[],
  
  -- Pathway stages
  stages JSONB NOT NULL, -- Stage definitions
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Certifications table
CREATE TABLE user_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  certification_pathway_id UUID REFERENCES certification_pathways(id),
  
  -- Certification status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired', 'revoked')),
  progress_percentage INTEGER DEFAULT 0,
  current_stage INTEGER DEFAULT 1,
  
  -- Dates
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Certificate details
  certificate_number TEXT UNIQUE,
  certificate_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  project_id UUID REFERENCES cpe_projects(id), -- Optional: course taken as part of project
  
  -- Enrollment details
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  current_module_id UUID REFERENCES modules(id),
  
  -- Status
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped', 'failed')),
  
  -- Scores and feedback
  final_score INTEGER CHECK (final_score >= 0 AND final_score <= 100),
  feedback TEXT,
  
  UNIQUE(user_id, course_id)
);

-- Module Progress table
CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  
  -- Progress details
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  
  -- Status and scores
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  
  -- Interaction data
  interactions JSONB, -- Video progress, quiz attempts, etc.
  
  UNIQUE(enrollment_id, module_id)
);

-- Create indexes for performance
CREATE INDEX idx_organizations_sector ON organizations(sector);
CREATE INDEX idx_organizations_type ON organizations(organization_type);
CREATE INDEX idx_users_role ON users(user_role);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_projects_status ON cpe_projects(status);
CREATE INDEX idx_projects_category ON cpe_projects(category);
CREATE INDEX idx_projects_sector ON cpe_projects(sector);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_committees_type ON consultation_committees(committee_type);
CREATE INDEX idx_committees_sector ON consultation_committees(sector);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpe_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS user_role_type AS $$
  SELECT user_role FROM users WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id = (SELECT organization_id FROM users WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('ministry_personnel', 'system_admin'))
  );

CREATE POLICY "Ministry personnel can manage organizations" ON organizations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('ministry_personnel', 'system_admin'))
  );

-- Users policies  
CREATE POLICY "Users can view themselves and colleagues" ON users
  FOR SELECT USING (
    id = auth.uid() OR
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('ministry_personnel', 'system_admin'))
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- CPE Projects policies
CREATE POLICY "Users can view projects they're involved in" ON cpe_projects
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) OR
    project_coordinator_id = auth.uid() OR
    EXISTS (SELECT 1 FROM project_consultants WHERE project_id = id AND consultant_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('ministry_personnel', 'system_admin'))
  );

-- Courses policies
CREATE POLICY "Published courses are viewable by all authenticated users" ON courses
  FOR SELECT USING (is_published = true AND auth.role() = 'authenticated');

CREATE POLICY "Instructors and admins can manage courses" ON courses
  FOR ALL USING (
    created_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('external_consultant', 'hr_specialist', 'management_coach', 'facilitation_expert', 'ministry_personnel', 'system_admin'))
  );

-- Enrollments policies
CREATE POLICY "Users can manage their own enrollments" ON enrollments
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Instructors can view enrollments for their courses" ON enrollments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND created_by = auth.uid())
  );

-- Consultation committees policies
CREATE POLICY "Committee members can view their committees" ON consultation_committees
  FOR SELECT USING (
    chairperson_id = auth.uid() OR
    EXISTS (SELECT 1 FROM committee_members WHERE committee_id = id AND user_id = auth.uid() AND is_active = true) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('ministry_personnel', 'system_admin'))
  );

-- Assessment results policies  
CREATE POLICY "Users can view their own assessment results" ON assessment_results
  FOR SELECT USING (
    user_id = auth.uid() OR
    reviewed_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_role IN ('ministry_personnel', 'system_admin'))
  );

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_committees_updated_at BEFORE UPDATE ON consultation_committees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON cpe_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessment_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON assessment_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pathways_updated_at BEFORE UPDATE ON certification_pathways FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON user_certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
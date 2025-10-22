-- SCORM Integration Database Schema Extension
-- Migration: Add SCORM support to CPE Academy

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SCORM Packages table
CREATE TABLE scorm_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  scorm_version TEXT NOT NULL CHECK (scorm_version IN ('1.2', '2004', 'xapi', 'cmi5')),
  package_identifier TEXT NOT NULL UNIQUE,
  package_title TEXT NOT NULL,
  manifest_xml TEXT NOT NULL,
  launch_url TEXT NOT NULL,
  package_size BIGINT,
  upload_path TEXT NOT NULL,
  mastery_score DECIMAL(5,2),
  max_time_allowed INTERVAL,
  time_limit_action TEXT CHECK (time_limit_action IN ('continue,message', 'continue,no message', 'exit,message', 'exit,no message')),
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SCORM Session Tracking
CREATE TABLE scorm_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  scorm_package_id UUID REFERENCES scorm_packages(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  launch_url TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- SCORM Runtime Data Model Elements
  completion_status TEXT DEFAULT 'incomplete' CHECK (completion_status IN ('completed', 'incomplete', 'not attempted', 'unknown')),
  success_status TEXT DEFAULT 'unknown' CHECK (success_status IN ('passed', 'failed', 'unknown')),
  score_raw DECIMAL(5,2),
  score_min DECIMAL(5,2) DEFAULT 0,
  score_max DECIMAL(5,2) DEFAULT 100,
  score_scaled DECIMAL(3,2), -- -1.0 to 1.0
  
  -- Time tracking
  total_time INTERVAL DEFAULT INTERVAL '0',
  session_time INTERVAL DEFAULT INTERVAL '0',
  
  -- Navigation and state
  location TEXT, -- bookmark location
  suspend_data TEXT, -- learner state data (max 64k)
  exit_reason TEXT CHECK (exit_reason IN ('time-out', 'suspend', 'logout', 'normal', '')),
  entry TEXT DEFAULT 'ab-initio' CHECK (entry IN ('ab-initio', 'resume', '')),
  mode TEXT DEFAULT 'normal' CHECK (mode IN ('browse', 'normal', 'review')),
  
  -- Session management
  is_active BOOLEAN DEFAULT true,
  terminated_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_score_range CHECK (score_raw >= score_min AND score_raw <= score_max),
  CONSTRAINT valid_scaled_score CHECK (score_scaled >= -1.0 AND score_scaled <= 1.0)
);

-- SCORM Interactions (for detailed tracking)
CREATE TABLE scorm_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES scorm_sessions(id) ON DELETE CASCADE,
  interaction_id TEXT NOT NULL,
  interaction_type TEXT CHECK (interaction_type IN ('true-false', 'choice', 'fill-in', 'long-fill-in', 'matching', 'performance', 'sequencing', 'likert', 'numeric', 'other')),
  objectives JSONB, -- array of objective identifiers
  timestamp_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  correct_responses JSONB, -- array of correct response patterns
  weighting DECIMAL(10,7),
  learner_response TEXT,
  result TEXT CHECK (result IN ('correct', 'incorrect', 'unanticipated', 'neutral')),
  latency INTERVAL,
  description TEXT,
  
  UNIQUE(session_id, interaction_id)
);

-- SCORM Objectives (learning objectives tracking)
CREATE TABLE scorm_objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES scorm_sessions(id) ON DELETE CASCADE,
  objective_id TEXT NOT NULL,
  score_raw DECIMAL(5,2),
  score_min DECIMAL(5,2),
  score_max DECIMAL(5,2),
  score_scaled DECIMAL(3,2),
  success_status TEXT CHECK (success_status IN ('passed', 'failed', 'unknown')),
  completion_status TEXT CHECK (completion_status IN ('completed', 'incomplete', 'not attempted', 'unknown')),
  progress_measure DECIMAL(3,2), -- 0.0 to 1.0
  description TEXT,
  
  UNIQUE(session_id, objective_id)
);

-- External LMS Integration
CREATE TABLE lms_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lms_type TEXT NOT NULL CHECK (lms_type IN ('moodle', 'canvas', 'blackboard', 'braintree', 'brightspace', 'schoology', 'sakai', 'edmodo', 'google_classroom', 'custom_lti')),
  lms_name TEXT NOT NULL,
  lms_version TEXT,
  
  -- API Configuration
  api_endpoint TEXT NOT NULL,
  api_credentials JSONB, -- Encrypted credentials
  
  -- LTI Configuration
  lti_version TEXT CHECK (lti_version IN ('1.0', '1.1', '1.3', '2.0')),
  consumer_key TEXT,
  shared_secret TEXT, -- Encrypted
  tool_consumer_instance_guid TEXT,
  
  -- SSO Configuration
  sso_config JSONB,
  sso_enabled BOOLEAN DEFAULT false,
  
  -- Integration Features
  grade_passback_enabled BOOLEAN DEFAULT false,
  roster_sync_enabled BOOLEAN DEFAULT false,
  content_sharing_enabled BOOLEAN DEFAULT false,
  deep_linking_enabled BOOLEAN DEFAULT false,
  
  -- Status and Health
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_health_check TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'maintenance')),
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grade Passback Tracking
CREATE TABLE grade_passback_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lms_integration_id UUID REFERENCES lms_integrations(id),
  
  -- External LMS identifiers
  external_user_id TEXT,
  external_course_id TEXT,
  external_assignment_id TEXT,
  lis_outcome_service_url TEXT,
  lis_result_sourcedid TEXT,
  
  -- Grade information
  grade_value DECIMAL(5,2),
  max_grade DECIMAL(5,2),
  grade_percent DECIMAL(5,2),
  letter_grade TEXT,
  
  -- Passback status
  passback_status TEXT DEFAULT 'pending' CHECK (passback_status IN ('pending', 'success', 'failed', 'retry', 'cancelled')),
  error_message TEXT,
  response_data JSONB,
  
  -- Retry logic
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LTI Launch Tracking
CREATE TABLE lti_launches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lms_integration_id UUID REFERENCES lms_integrations(id),
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  
  -- LTI Launch Parameters
  lti_message_type TEXT,
  lti_version TEXT,
  resource_link_id TEXT,
  context_id TEXT,
  context_label TEXT,
  context_title TEXT,
  user_id_lti TEXT, -- LTI user identifier
  roles TEXT, -- LTI roles
  
  -- Launch metadata
  launch_presentation_return_url TEXT,
  launch_presentation_locale TEXT,
  tool_consumer_instance_name TEXT,
  tool_consumer_instance_description TEXT,
  
  -- Session information
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  launched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- SCORM Content Asset Management
CREATE TABLE scorm_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scorm_package_id UUID REFERENCES scorm_packages(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- relative path within package
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  checksum TEXT, -- for integrity verification
  is_launch_file BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SCORM Package Dependencies
CREATE TABLE scorm_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scorm_package_id UUID REFERENCES scorm_packages(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL CHECK (dependency_type IN ('prerequisite', 'resource', 'library')),
  identifier TEXT NOT NULL,
  resource_uri TEXT,
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_scorm_packages_course ON scorm_packages(course_id);
CREATE INDEX idx_scorm_sessions_enrollment ON scorm_sessions(enrollment_id);
CREATE INDEX idx_scorm_sessions_package ON scorm_sessions(scorm_package_id);
CREATE INDEX idx_scorm_sessions_active ON scorm_sessions(is_active, last_accessed_at);
CREATE INDEX idx_scorm_interactions_session ON scorm_interactions(session_id);
CREATE INDEX idx_scorm_objectives_session ON scorm_objectives(session_id);
CREATE INDEX idx_lms_integrations_org ON lms_integrations(organization_id);
CREATE INDEX idx_grade_passback_enrollment ON grade_passback_log(enrollment_id);
CREATE INDEX idx_grade_passback_status ON grade_passback_log(passback_status, next_retry_at);
CREATE INDEX idx_lti_launches_integration ON lti_launches(lms_integration_id);
CREATE INDEX idx_lti_launches_user ON lti_launches(user_id);
CREATE INDEX idx_scorm_assets_package ON scorm_assets(scorm_package_id);

-- Enable Row Level Security
ALTER TABLE scorm_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorm_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorm_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorm_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_passback_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lti_launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorm_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scorm_dependencies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SCORM data

-- SCORM Packages: Users can see packages for courses they have access to
CREATE POLICY "Users can view scorm packages for accessible courses" ON scorm_packages FOR SELECT
USING (
  course_id IN (
    SELECT c.id FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id
    WHERE e.user_id = auth.uid() OR c.created_by = auth.uid()
  )
);

-- SCORM Sessions: Users can only access their own sessions
CREATE POLICY "Users can access own scorm sessions" ON scorm_sessions FOR ALL
USING (
  enrollment_id IN (
    SELECT id FROM enrollments WHERE user_id = auth.uid()
  )
);

-- SCORM Interactions: Users can only access their own interactions
CREATE POLICY "Users can access own scorm interactions" ON scorm_interactions FOR ALL
USING (
  session_id IN (
    SELECT s.id FROM scorm_sessions s
    JOIN enrollments e ON s.enrollment_id = e.id
    WHERE e.user_id = auth.uid()
  )
);

-- LMS Integrations: Organization members can view their organization's integrations
CREATE POLICY "Users can view organization lms integrations" ON lms_integrations FOR SELECT
USING (
  organization_id IN (
    SELECT u.organization_id FROM users u WHERE u.id = auth.uid()
  )
);

-- Functions for SCORM Runtime API

-- Function to initialize SCORM session
CREATE OR REPLACE FUNCTION initialize_scorm_session(
  p_enrollment_id UUID,
  p_scorm_package_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_session_id TEXT;
  v_existing_session scorm_sessions%ROWTYPE;
BEGIN
  -- Generate unique session ID
  v_session_id := 'scorm_' || generate_random_uuid();
  
  -- Check for existing active session
  SELECT * INTO v_existing_session
  FROM scorm_sessions
  WHERE enrollment_id = p_enrollment_id 
    AND scorm_package_id = p_scorm_package_id 
    AND is_active = true;
    
  -- If existing session found, reactivate it
  IF FOUND THEN
    UPDATE scorm_sessions 
    SET last_accessed_at = NOW(),
        session_id = v_session_id
    WHERE id = v_existing_session.id;
    RETURN v_session_id;
  END IF;
  
  -- Create new session
  INSERT INTO scorm_sessions (
    enrollment_id, scorm_package_id, session_id, launch_url
  ) VALUES (
    p_enrollment_id, p_scorm_package_id, v_session_id, 
    (SELECT launch_url FROM scorm_packages WHERE id = p_scorm_package_id)
  );
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update SCORM session progress
CREATE OR REPLACE FUNCTION update_scorm_progress(
  p_session_id TEXT,
  p_completion_status TEXT DEFAULT NULL,
  p_success_status TEXT DEFAULT NULL,
  p_score_raw DECIMAL DEFAULT NULL,
  p_total_time INTERVAL DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_suspend_data TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE scorm_sessions SET
    completion_status = COALESCE(p_completion_status, completion_status),
    success_status = COALESCE(p_success_status, success_status),
    score_raw = COALESCE(p_score_raw, score_raw),
    total_time = COALESCE(p_total_time, total_time),
    location = COALESCE(p_location, location),
    suspend_data = COALESCE(p_suspend_data, suspend_data),
    last_accessed_at = NOW()
  WHERE session_id = p_session_id;
  
  -- Update enrollment progress if completion status changed
  IF p_completion_status = 'completed' THEN
    UPDATE enrollments SET
      progress_percentage = 100,
      completed_at = CASE WHEN completed_at IS NULL THEN NOW() ELSE completed_at END
    WHERE id = (
      SELECT enrollment_id FROM scorm_sessions WHERE session_id = p_session_id
    );
  END IF;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
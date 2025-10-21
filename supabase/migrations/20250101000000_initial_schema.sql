-- CPE Academy LMS Database Schema with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  project_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('admin', 'instructor', 'learner')),
  preferred_locale TEXT NOT NULL DEFAULT 'en' CHECK (preferred_locale IN ('en', 'fr')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  duration_minutes INTEGER NOT NULL,
  created_by UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT false,
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
  video_url TEXT,
  content_en TEXT,
  content_fr TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quizzes table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  question_en TEXT NOT NULL,
  question_fr TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  UNIQUE(user_id, course_id)
);

-- Module Progress table
CREATE TABLE module_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  quiz_score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enrollment_id, module_id)
);

-- Artifacts table
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_quizzes_module ON quizzes(module_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_module_progress_enrollment ON module_progress(enrollment_id);
CREATE INDEX idx_artifacts_enrollment ON artifacts(enrollment_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Courses
CREATE POLICY "Published courses are visible to all authenticated users"
  ON courses FOR SELECT
  USING (is_published = true AND auth.role() = 'authenticated');

CREATE POLICY "Instructors and admins can manage courses"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- RLS Policies for Modules
CREATE POLICY "Modules of published courses are visible to all"
  ON modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = modules.course_id 
      AND courses.is_published = true
    )
  );

CREATE POLICY "Instructors and admins can manage modules"
  ON modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- RLS Policies for Quizzes
CREATE POLICY "Quizzes are visible to enrolled users"
  ON quizzes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON c.id = m.course_id
      JOIN enrollments e ON e.course_id = c.id
      WHERE m.id = quizzes.module_id
      AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Instructors and admins can manage quizzes"
  ON quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'instructor')
    )
  );

-- RLS Policies for Enrollments
CREATE POLICY "Users can view their own enrollments"
  ON enrollments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own enrollments"
  ON enrollments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own enrollments"
  ON enrollments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all enrollments"
  ON enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Module Progress
CREATE POLICY "Users can view their own module progress"
  ON module_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.id = module_progress.enrollment_id 
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own module progress"
  ON module_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.id = module_progress.enrollment_id 
      AND enrollments.user_id = auth.uid()
    )
  );

-- RLS Policies for Artifacts
CREATE POLICY "Users can view their own artifacts"
  ON artifacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.id = artifacts.enrollment_id 
      AND enrollments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own artifacts"
  ON artifacts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enrollments 
      WHERE enrollments.id = artifacts.enrollment_id 
      AND enrollments.user_id = auth.uid()
    )
  );

-- RLS Policies for Audit Logs
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_progress_updated_at BEFORE UPDATE ON module_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit triggers for key tables
CREATE TRIGGER audit_enrollments AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_module_progress AFTER INSERT OR UPDATE OR DELETE ON module_progress
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_artifacts AFTER INSERT OR UPDATE OR DELETE ON artifacts
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          type: string
          project_code: string | null
          slug?: string
          settings?: Json
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'cancelled' | 'past_due'
          billing_email?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          project_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          project_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scorm_packages: {
        Row: {
          id: string
          organization_id: string
          title: string
          identifier: string
          version: string
          scorm_version: '1.2' | '2004' | 'xapi' | 'cmi5'
          file_path: string
          launch_url: string
          manifest_data: Json
          size_bytes: number
          uploaded_by: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          identifier: string
          version: string
          scorm_version: '1.2' | '2004' | 'xapi' | 'cmi5'
          file_path: string
          launch_url: string
          manifest_data?: Json
          size_bytes: number
          uploaded_by: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          identifier?: string
          version?: string
          scorm_version?: '1.2' | '2004' | 'xapi' | 'cmi5'
          file_path?: string
          launch_url?: string
          manifest_data?: Json
          size_bytes?: number
          uploaded_by?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      scorm_sessions: {
        Row: {
          id: string
          package_id: string
          user_id: string
          organization_id: string
          attempt_number: number
          session_status: 'active' | 'completed' | 'terminated' | 'suspended'
          lesson_status: 'passed' | 'completed' | 'failed' | 'incomplete' | 'browsed' | 'not attempted'
          entry: 'ab-initio' | 'resume' | ''
          lesson_mode: 'browse' | 'normal' | 'review'
          lesson_location: string | null
          suspend_data: string | null
          score_raw: number | null
          score_max: number | null
          score_min: number | null
          completion_status: 'completed' | 'incomplete' | 'not_attempted' | 'unknown'
          success_status: 'passed' | 'failed' | 'unknown'
          session_time: string | null
          total_time: string | null
          exit: 'time-out' | 'suspend' | 'logout' | 'normal' | ''
          created_at: string
          last_accessed: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          package_id: string
          user_id: string
          organization_id: string
          attempt_number: number
          session_status?: 'active' | 'completed' | 'terminated' | 'suspended'
          lesson_status?: 'passed' | 'completed' | 'failed' | 'incomplete' | 'browsed' | 'not attempted'
          entry?: 'ab-initio' | 'resume' | ''
          lesson_mode?: 'browse' | 'normal' | 'review'
          lesson_location?: string | null
          suspend_data?: string | null
          score_raw?: number | null
          score_max?: number | null
          score_min?: number | null
          completion_status?: 'completed' | 'incomplete' | 'not_attempted' | 'unknown'
          success_status?: 'passed' | 'failed' | 'unknown'
          session_time?: string | null
          total_time?: string | null
          exit?: 'time-out' | 'suspend' | 'logout' | 'normal' | ''
          created_at?: string
          last_accessed?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          package_id?: string
          user_id?: string
          organization_id?: string
          attempt_number?: number
          session_status?: 'active' | 'completed' | 'terminated' | 'suspended'
          lesson_status?: 'passed' | 'completed' | 'failed' | 'incomplete' | 'browsed' | 'not attempted'
          entry?: 'ab-initio' | 'resume' | ''
          lesson_mode?: 'browse' | 'normal' | 'review'
          lesson_location?: string | null
          suspend_data?: string | null
          score_raw?: number | null
          score_max?: number | null
          score_min?: number | null
          completion_status?: 'completed' | 'incomplete' | 'not_attempted' | 'unknown'
          success_status?: 'passed' | 'failed' | 'unknown'
          session_time?: string | null
          total_time?: string | null
          exit?: 'time-out' | 'suspend' | 'logout' | 'normal' | ''
          created_at?: string
          last_accessed?: string
          completed_at?: string | null
        }
      }
      scorm_interactions: {
        Row: {
          id: string
          session_id: string
          interaction_id: string
          interaction_type: 'true-false' | 'choice' | 'fill-in' | 'long-fill-in' | 'matching' | 'performance' | 'sequencing' | 'likert' | 'numeric' | 'other'
          objectives: Json | null
          timestamp: string
          correct_responses: Json | null
          weighting: number | null
          learner_response: string | null
          result: 'correct' | 'incorrect' | 'unanticipated' | 'neutral' | 'real'
          latency: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          interaction_id: string
          interaction_type: 'true-false' | 'choice' | 'fill-in' | 'long-fill-in' | 'matching' | 'performance' | 'sequencing' | 'likert' | 'numeric' | 'other'
          objectives?: Json | null
          timestamp: string
          correct_responses?: Json | null
          weighting?: number | null
          learner_response?: string | null
          result: 'correct' | 'incorrect' | 'unanticipated' | 'neutral' | 'real'
          latency?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          interaction_id?: string
          interaction_type?: 'true-false' | 'choice' | 'fill-in' | 'long-fill-in' | 'matching' | 'performance' | 'sequencing' | 'likert' | 'numeric' | 'other'
          objectives?: Json | null
          timestamp?: string
          correct_responses?: Json | null
          weighting?: number | null
          learner_response?: string | null
          result?: 'correct' | 'incorrect' | 'unanticipated' | 'neutral' | 'real'
          latency?: string | null
          description?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          organization_id: string | null
          role: 'admin' | 'instructor' | 'learner'
          preferred_locale: 'en' | 'fr'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          organization_id?: string | null
          role?: 'admin' | 'instructor' | 'learner'
          preferred_locale?: 'en' | 'fr'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          organization_id?: string | null
          role?: 'admin' | 'instructor' | 'learner'
          preferred_locale?: 'en' | 'fr'
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title_en: string
          title_fr: string
          description_en: string | null
          description_fr: string | null
          duration_minutes: number
          created_by: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_en: string
          title_fr: string
          description_en?: string | null
          description_fr?: string | null
          duration_minutes: number
          created_by: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_en?: string
          title_fr?: string
          description_en?: string | null
          description_fr?: string | null
          duration_minutes?: number
          created_by?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title_en: string
          title_fr: string
          order_index: number
          video_url: string | null
          content_en: string | null
          content_fr: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title_en: string
          title_fr: string
          order_index: number
          video_url?: string | null
          content_en?: string | null
          content_fr?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title_en?: string
          title_fr?: string
          order_index?: number
          video_url?: string | null
          content_en?: string | null
          content_fr?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          module_id: string
          question_en: string
          question_fr: string
          options: Json
          correct_answer: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          module_id: string
          question_en: string
          question_fr: string
          options: Json
          correct_answer: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          question_en?: string
          question_fr?: string
          options?: Json
          correct_answer?: number
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          completed_at: string | null
          progress_percentage: number
          certificate_issued: boolean
          certificate_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
          certificate_issued?: boolean
          certificate_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrolled_at?: string
          completed_at?: string | null
          progress_percentage?: number
          certificate_issued?: boolean
          certificate_url?: string | null
        }
      }
      module_progress: {
        Row: {
          id: string
          enrollment_id: string
          module_id: string
          completed: boolean
          quiz_score: number | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          enrollment_id: string
          module_id: string
          completed?: boolean
          quiz_score?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string
          module_id?: string
          completed?: boolean
          quiz_score?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artifacts: {
        Row: {
          id: string
          enrollment_id: string
          file_name: string
          file_url: string
          file_type: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          enrollment_id: string
          file_name: string
          file_url: string
          file_type: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          enrollment_id?: string
          file_name?: string
          file_url?: string
          file_type?: string
          uploaded_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      permissions: {
        Row: {
          id: string
          name: string
          display_name_en: string
          display_name_fr: string
          category: string
          description_en: string | null
          description_fr: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name_en: string
          display_name_fr: string
          category: string
          description_en?: string | null
          description_fr?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name_en?: string
          display_name_fr?: string
          category?: string
          description_en?: string | null
          description_fr?: string | null
          created_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          organization_id: string | null
          name: string
          display_name_en: string
          display_name_fr: string
          description_en: string | null
          description_fr: string | null
          is_system_role: boolean
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          name: string
          display_name_en: string
          display_name_fr: string
          description_en?: string | null
          description_fr?: string | null
          is_system_role?: boolean
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          name?: string
          display_name_en?: string
          display_name_fr?: string
          description_en?: string | null
          description_fr?: string | null
          is_system_role?: boolean
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          organization_id: string | null
          assigned_by: string | null
          assigned_at: string
          expires_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          organization_id?: string | null
          assigned_by?: string | null
          assigned_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          organization_id?: string | null
          assigned_by?: string | null
          assigned_at?: string
          expires_at?: string | null
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'instructor' | 'learner'
      locale: 'en' | 'fr'
    }
  }
}

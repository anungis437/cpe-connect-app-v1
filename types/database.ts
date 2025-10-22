// CPE Connect Database Types - Enhanced for CPE Program Structure

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type InterventionCategory = 
  | 'enterprise_interventions'
  | 'partnership_interventions' 
  | 'sectoral_interventions';

export type EnterpriseInterventionType = 
  | 'coaching_management_development'
  | 'recruitment_support'
  | 'hr_management_support'
  | 'employment_stabilization'
  | 'work_time_arrangements_artt'
  | 'reclassification_committee';

export type PartnershipInterventionType = 
  | 'ad_hoc_consultation_tables'
  | 'active_measure_support'
  | 'other_consultation_projects';

export type SectoralInterventionType = 
  | 'sectoral_workforce_committees'
  | 'advisory_committees';

export type UserRoleType = 
  | 'external_consultant'
  | 'hr_specialist'
  | 'management_coach'
  | 'facilitation_expert'
  | 'project_coordinator'
  | 'hr_coordinator'
  | 'committee_animator'
  | 'enterprise_representative'
  | 'worker_representative'
  | 'employer_representative'
  | 'ministry_personnel'
  | 'sector_advisor'
  | 'committee_member'
  | 'committee_chair'
  | 'system_admin';

export type OrganizationType = 
  | 'sme_6_99_employees'
  | 'private_enterprise'
  | 'worker_association'
  | 'employer_association'
  | 'professional_association'
  | 'non_profit_organization'
  | 'cooperative'
  | 'independent_worker'
  | 'employer_group'
  | 'worker_group'
  | 'training_establishment'
  | 'municipal_administration'
  | 'band_council'
  | 'municipal_admin_own_hr'
  | 'parapublic_provincial'
  | 'parapublic_federal'
  | 'private_training_own_hr'
  | 'health_social_services_own_hr'
  | 'band_council_own_hr';

export type EconomicSector = 
  | 'manufacturing'
  | 'construction'
  | 'transportation'
  | 'information_technology'
  | 'healthcare_social_services'
  | 'education_training'
  | 'retail_commerce'
  | 'hospitality_tourism'
  | 'agriculture_forestry'
  | 'mining_extraction'
  | 'financial_services'
  | 'professional_services'
  | 'arts_culture_recreation'
  | 'public_administration'
  | 'utilities'
  | 'real_estate'
  | 'waste_management'
  | 'telecommunications'
  | 'biotechnology'
  | 'aerospace'
  | 'textile_clothing'
  | 'food_processing'
  | 'chemicals_plastics'
  | 'metal_transformation'
  | 'wood_paper'
  | 'printing_publishing'
  | 'maritime'
  | 'community_social_economy'
  | 'green_economy';

export type PriorityFundingSector = 
  | 'digital_transformation_productivity'
  | 'experienced_workers'
  | 'community_sector'
  | 'information_technology'
  | 'green_economy_plan';

export type ProjectStatus = 
  | 'planning'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type CommitteeType = 
  | 'enterprise'
  | 'sectoral'
  | 'ad_hoc'
  | 'advisory';

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          name_fr: string | null
          organization_type: OrganizationType
          neq_number: string | null
          sector: EconomicSector
          employee_count: number | null
          is_priority_sme: boolean | null
          address: Json | null
          contact_info: Json | null
          eligibility_status: string | null
          eligibility_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          name_fr?: string | null
          organization_type: OrganizationType
          neq_number?: string | null
          sector: EconomicSector
          employee_count?: number | null
          is_priority_sme?: boolean | null
          address?: Json | null
          contact_info?: Json | null
          eligibility_status?: string | null
          eligibility_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          name_fr?: string | null
          organization_type?: OrganizationType
          neq_number?: string | null
          sector?: EconomicSector
          employee_count?: number | null
          is_priority_sme?: boolean | null
          address?: Json | null
          contact_info?: Json | null
          eligibility_status?: string | null
          eligibility_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          organization_id: string | null
          user_role: UserRoleType
          preferred_locale: string
          specializations: string[] | null
          certifications: Json | null
          experience_years: number | null
          hourly_rate: number | null
          availability: Json | null
          profile_verified: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          organization_id?: string | null
          user_role?: UserRoleType
          preferred_locale?: string
          specializations?: string[] | null
          certifications?: Json | null
          experience_years?: number | null
          hourly_rate?: number | null
          availability?: Json | null
          profile_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          organization_id?: string | null
          user_role?: UserRoleType
          preferred_locale?: string
          specializations?: string[] | null
          certifications?: Json | null
          experience_years?: number | null
          hourly_rate?: number | null
          availability?: Json | null
          profile_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      consultation_committees: {
        Row: {
          id: string
          name: string
          name_fr: string | null
          committee_type: CommitteeType
          sector: EconomicSector | null
          organization_id: string | null
          chairperson_id: string | null
          objectives: string[] | null
          objectives_fr: string[] | null
          mandate_start_date: string
          mandate_end_date: string | null
          meeting_frequency: string | null
          next_meeting: string | null
          status: string | null
          deliverables: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          name_fr?: string | null
          committee_type: CommitteeType
          sector?: EconomicSector | null
          organization_id?: string | null
          chairperson_id?: string | null
          objectives?: string[] | null
          objectives_fr?: string[] | null
          mandate_start_date: string
          mandate_end_date?: string | null
          meeting_frequency?: string | null
          next_meeting?: string | null
          status?: string | null
          deliverables?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          name_fr?: string | null
          committee_type?: CommitteeType
          sector?: EconomicSector | null
          organization_id?: string | null
          chairperson_id?: string | null
          objectives?: string[] | null
          objectives_fr?: string[] | null
          mandate_start_date?: string
          mandate_end_date?: string | null
          meeting_frequency?: string | null
          next_meeting?: string | null
          status?: string | null
          deliverables?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      committee_members: {
        Row: {
          id: string
          committee_id: string
          user_id: string
          role_in_committee: UserRoleType
          organization_name: string | null
          joined_date: string | null
          left_date: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          committee_id: string
          user_id: string
          role_in_committee: UserRoleType
          organization_name?: string | null
          joined_date?: string | null
          left_date?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          committee_id?: string
          user_id?: string
          role_in_committee?: UserRoleType
          organization_name?: string | null
          joined_date?: string | null
          left_date?: string | null
          is_active?: boolean | null
        }
      }
      cpe_projects: {
        Row: {
          id: string
          title: string
          title_fr: string | null
          description: string | null
          description_fr: string | null
          category: InterventionCategory
          enterprise_intervention_type: EnterpriseInterventionType | null
          partnership_intervention_type: PartnershipInterventionType | null
          sectoral_intervention_type: SectoralInterventionType | null
          organization_id: string
          sector: EconomicSector
          total_budget: number
          ministry_contribution: number
          funding_rate: number | null
          priority_sector: PriorityFundingSector | null
          start_date: string
          end_date: string
          duration_months: number
          extension_count: number | null
          project_coordinator_id: string | null
          committee_id: string | null
          status: ProjectStatus | null
          progress_percentage: number | null
          objectives: Json | null
          deliverables: Json | null
          outcomes: Json | null
          reporting_frequency: string | null
          last_report_date: string | null
          next_report_due: string | null
          compliance_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          title_fr?: string | null
          description?: string | null
          description_fr?: string | null
          category: InterventionCategory
          enterprise_intervention_type?: EnterpriseInterventionType | null
          partnership_intervention_type?: PartnershipInterventionType | null
          sectoral_intervention_type?: SectoralInterventionType | null
          organization_id: string
          sector: EconomicSector
          total_budget: number
          ministry_contribution: number
          funding_rate?: number | null
          priority_sector?: PriorityFundingSector | null
          start_date: string
          end_date: string
          duration_months: number
          extension_count?: number | null
          project_coordinator_id?: string | null
          committee_id?: string | null
          status?: ProjectStatus | null
          progress_percentage?: number | null
          objectives?: Json | null
          deliverables?: Json | null
          outcomes?: Json | null
          reporting_frequency?: string | null
          last_report_date?: string | null
          next_report_due?: string | null
          compliance_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          title_fr?: string | null
          description?: string | null
          description_fr?: string | null
          category?: InterventionCategory
          enterprise_intervention_type?: EnterpriseInterventionType | null
          partnership_intervention_type?: PartnershipInterventionType | null
          sectoral_intervention_type?: SectoralInterventionType | null
          organization_id?: string
          sector?: EconomicSector
          total_budget?: number
          ministry_contribution?: number
          funding_rate?: number | null
          priority_sector?: PriorityFundingSector | null
          start_date?: string
          end_date?: string
          duration_months?: number
          extension_count?: number | null
          project_coordinator_id?: string | null
          committee_id?: string | null
          status?: ProjectStatus | null
          progress_percentage?: number | null
          objectives?: Json | null
          deliverables?: Json | null
          outcomes?: Json | null
          reporting_frequency?: string | null
          last_report_date?: string | null
          next_report_due?: string | null
          compliance_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      project_consultants: {
        Row: {
          id: string
          project_id: string
          consultant_id: string
          role_description: string | null
          hourly_rate: number | null
          total_hours_allocated: number | null
          hours_completed: number | null
          start_date: string | null
          end_date: string | null
        }
        Insert: {
          id?: string
          project_id: string
          consultant_id: string
          role_description?: string | null
          hourly_rate?: number | null
          total_hours_allocated?: number | null
          hours_completed?: number | null
          start_date?: string | null
          end_date?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          consultant_id?: string
          role_description?: string | null
          hourly_rate?: number | null
          total_hours_allocated?: number | null
          hours_completed?: number | null
          start_date?: string | null
          end_date?: string | null
        }
      }
      courses: {
        Row: {
          id: string
          title_en: string
          title_fr: string
          description_en: string | null
          description_fr: string | null
          category: InterventionCategory
          enterprise_intervention_type: EnterpriseInterventionType | null
          partnership_intervention_type: PartnershipInterventionType | null
          sectoral_intervention_type: SectoralInterventionType | null
          target_sector: EconomicSector | null
          duration_hours: number
          difficulty_level: string | null
          prerequisites: string[] | null
          learning_objectives_en: string[] | null
          learning_objectives_fr: string[] | null
          competencies: string[] | null
          target_roles: UserRoleType[] | null
          assessment_type: string | null
          has_certification: boolean | null
          certification_pathway_id: string | null
          funding_eligible: boolean | null
          priority_funding: PriorityFundingSector | null
          consultation_required: boolean | null
          collaboration_tools: string[] | null
          created_by: string | null
          is_published: boolean | null
          language: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title_en: string
          title_fr: string
          description_en?: string | null
          description_fr?: string | null
          category: InterventionCategory
          enterprise_intervention_type?: EnterpriseInterventionType | null
          partnership_intervention_type?: PartnershipInterventionType | null
          sectoral_intervention_type?: SectoralInterventionType | null
          target_sector?: EconomicSector | null
          duration_hours: number
          difficulty_level?: string | null
          prerequisites?: string[] | null
          learning_objectives_en?: string[] | null
          learning_objectives_fr?: string[] | null
          competencies?: string[] | null
          target_roles?: UserRoleType[] | null
          assessment_type?: string | null
          has_certification?: boolean | null
          certification_pathway_id?: string | null
          funding_eligible?: boolean | null
          priority_funding?: PriorityFundingSector | null
          consultation_required?: boolean | null
          collaboration_tools?: string[] | null
          created_by?: string | null
          is_published?: boolean | null
          language?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title_en?: string
          title_fr?: string
          description_en?: string | null
          description_fr?: string | null
          category?: InterventionCategory
          enterprise_intervention_type?: EnterpriseInterventionType | null
          partnership_intervention_type?: PartnershipInterventionType | null
          sectoral_intervention_type?: SectoralInterventionType | null
          target_sector?: EconomicSector | null
          duration_hours?: number
          difficulty_level?: string | null
          prerequisites?: string[] | null
          learning_objectives_en?: string[] | null
          learning_objectives_fr?: string[] | null
          competencies?: string[] | null
          target_roles?: UserRoleType[] | null
          assessment_type?: string | null
          has_certification?: boolean | null
          certification_pathway_id?: string | null
          funding_eligible?: boolean | null
          priority_funding?: PriorityFundingSector | null
          consultation_required?: boolean | null
          collaboration_tools?: string[] | null
          created_by?: string | null
          is_published?: boolean | null
          language?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title_en: string
          title_fr: string
          order_index: number
          content_en: string | null
          content_fr: string | null
          video_url: string | null
          resources: Json | null
          has_quiz: boolean | null
          has_practical_exercise: boolean | null
          collaboration_activity: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          course_id: string
          title_en: string
          title_fr: string
          order_index: number
          content_en?: string | null
          content_fr?: string | null
          video_url?: string | null
          resources?: Json | null
          has_quiz?: boolean | null
          has_practical_exercise?: boolean | null
          collaboration_activity?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          course_id?: string
          title_en?: string
          title_fr?: string
          order_index?: number
          content_en?: string | null
          content_fr?: string | null
          video_url?: string | null
          resources?: Json | null
          has_quiz?: boolean | null
          has_practical_exercise?: boolean | null
          collaboration_activity?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      assessment_tools: {
        Row: {
          id: string
          name_en: string
          name_fr: string
          tool_type: string | null
          category: InterventionCategory
          target_roles: UserRoleType[] | null
          questions: Json
          scoring_criteria: Json
          report_template: string | null
          recommendation_rules: Json | null
          is_published: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name_en: string
          name_fr: string
          tool_type?: string | null
          category: InterventionCategory
          target_roles?: UserRoleType[] | null
          questions: Json
          scoring_criteria: Json
          report_template?: string | null
          recommendation_rules?: Json | null
          is_published?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name_en?: string
          name_fr?: string
          tool_type?: string | null
          category?: InterventionCategory
          target_roles?: UserRoleType[] | null
          questions?: Json
          scoring_criteria?: Json
          report_template?: string | null
          recommendation_rules?: Json | null
          is_published?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      assessment_results: {
        Row: {
          id: string
          assessment_tool_id: string | null
          user_id: string | null
          project_id: string | null
          responses: Json
          scores: Json
          recommendations: Json | null
          report_data: Json | null
          status: string | null
          completed_at: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          assessment_tool_id?: string | null
          user_id?: string | null
          project_id?: string | null
          responses: Json
          scores: Json
          recommendations?: Json | null
          report_data?: Json | null
          status?: string | null
          completed_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          assessment_tool_id?: string | null
          user_id?: string | null
          project_id?: string | null
          responses?: Json
          scores?: Json
          recommendations?: Json | null
          report_data?: Json | null
          status?: string | null
          completed_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      certification_pathways: {
        Row: {
          id: string
          name_en: string
          name_fr: string
          description_en: string | null
          description_fr: string | null
          category: InterventionCategory
          target_role: UserRoleType
          prerequisites: string[] | null
          required_courses: string[] | null
          optional_courses: string[] | null
          required_assessments: string[] | null
          minimum_experience_months: number | null
          validity_period_months: number
          renewal_requirements: string[] | null
          issuing_authority: string
          recognized_by: string[] | null
          stages: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name_en: string
          name_fr: string
          description_en?: string | null
          description_fr?: string | null
          category: InterventionCategory
          target_role: UserRoleType
          prerequisites?: string[] | null
          required_courses?: string[] | null
          optional_courses?: string[] | null
          required_assessments?: string[] | null
          minimum_experience_months?: number | null
          validity_period_months: number
          renewal_requirements?: string[] | null
          issuing_authority: string
          recognized_by?: string[] | null
          stages: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name_en?: string
          name_fr?: string
          description_en?: string | null
          description_fr?: string | null
          category?: InterventionCategory
          target_role?: UserRoleType
          prerequisites?: string[] | null
          required_courses?: string[] | null
          optional_courses?: string[] | null
          required_assessments?: string[] | null
          minimum_experience_months?: number | null
          validity_period_months?: number
          renewal_requirements?: string[] | null
          issuing_authority?: string
          recognized_by?: string[] | null
          stages?: Json
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_certifications: {
        Row: {
          id: string
          user_id: string
          certification_pathway_id: string | null
          status: string | null
          progress_percentage: number | null
          current_stage: number | null
          started_at: string | null
          completed_at: string | null
          expires_at: string | null
          certificate_number: string | null
          certificate_data: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          certification_pathway_id?: string | null
          status?: string | null
          progress_percentage?: number | null
          current_stage?: number | null
          started_at?: string | null
          completed_at?: string | null
          expires_at?: string | null
          certificate_number?: string | null
          certificate_data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          certification_pathway_id?: string | null
          status?: string | null
          progress_percentage?: number | null
          current_stage?: number | null
          started_at?: string | null
          completed_at?: string | null
          expires_at?: string | null
          certificate_number?: string | null
          certificate_data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          project_id: string | null
          enrolled_at: string | null
          started_at: string | null
          completed_at: string | null
          progress_percentage: number | null
          current_module_id: string | null
          status: string | null
          final_score: number | null
          feedback: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          project_id?: string | null
          enrolled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          progress_percentage?: number | null
          current_module_id?: string | null
          status?: string | null
          final_score?: number | null
          feedback?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          project_id?: string | null
          enrolled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          progress_percentage?: number | null
          current_module_id?: string | null
          status?: string | null
          final_score?: number | null
          feedback?: string | null
        }
      }
      module_progress: {
        Row: {
          id: string
          enrollment_id: string
          module_id: string
          started_at: string | null
          completed_at: string | null
          time_spent_minutes: number | null
          status: string | null
          score: number | null
          interactions: Json | null
        }
        Insert: {
          id?: string
          enrollment_id: string
          module_id: string
          started_at?: string | null
          completed_at?: string | null
          time_spent_minutes?: number | null
          status?: string | null
          score?: number | null
          interactions?: Json | null
        }
        Update: {
          id?: string
          enrollment_id?: string
          module_id?: string
          started_at?: string | null
          completed_at?: string | null
          time_spent_minutes?: number | null
          status?: string | null
          score?: number | null
          interactions?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: {
          user_uuid: string
        }
        Returns: UserRoleType
      }
    }
    Enums: {
      intervention_category: InterventionCategory
      enterprise_intervention_type: EnterpriseInterventionType
      partnership_intervention_type: PartnershipInterventionType
      sectoral_intervention_type: SectoralInterventionType
      user_role_type: UserRoleType
      organization_type: OrganizationType
      economic_sector: EconomicSector
      priority_funding_sector: PriorityFundingSector
      project_status: ProjectStatus
      committee_type: CommitteeType
    }
  }
}
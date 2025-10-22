/**
 * CPE Platform Content Structure & Database Schema
 * Based on analysis of 00_CPE_generalites.pdf
 */

// Content Categories based on CPE Structure
export const INTERVENTION_CATEGORIES = {
  ENTERPRISE: 'enterprise_interventions',
  PARTNERSHIP: 'partnership_interventions', 
  SECTORAL: 'sectoral_interventions'
} as const;

// Enterprise Intervention Types (6 sub-categories)
export const ENTERPRISE_INTERVENTION_TYPES = {
  COACHING_MANAGEMENT: 'coaching_management_development',
  RECRUITMENT_SUPPORT: 'recruitment_support',
  HR_MANAGEMENT: 'hr_management_support',
  EMPLOYMENT_STABILIZATION: 'employment_stabilization',
  WORK_TIME_ARRANGEMENTS: 'work_time_arrangements_artt',
  RECLASSIFICATION_COMMITTEE: 'reclassification_committee'
} as const;

// Partnership Intervention Types (3 sub-categories)  
export const PARTNERSHIP_INTERVENTION_TYPES = {
  AD_HOC_CONSULTATION: 'ad_hoc_consultation_tables',
  ACTIVE_MEASURE_SUPPORT: 'active_measure_support',
  OTHER_CONSULTATION: 'other_consultation_projects'
} as const;

// Sectoral Intervention Types
export const SECTORAL_INTERVENTION_TYPES = {
  SECTORAL_COMMITTEES: 'sectoral_workforce_committees', // 29 sectors
  ADVISORY_COMMITTEES: 'advisory_committees'
} as const;

// User Roles based on CPE analysis
export const USER_ROLES = {
  // External service providers
  EXTERNAL_CONSULTANT: 'external_consultant',
  HR_SPECIALIST: 'hr_specialist', 
  MANAGEMENT_COACH: 'management_coach',
  FACILITATION_EXPERT: 'facilitation_expert',
  
  // Internal coordinators
  PROJECT_COORDINATOR: 'project_coordinator',
  HR_COORDINATOR: 'hr_coordinator',
  COMMITTEE_ANIMATOR: 'committee_animator',
  
  // Organization representatives
  ENTERPRISE_REP: 'enterprise_representative',
  WORKER_REP: 'worker_representative',
  EMPLOYER_REP: 'employer_representative',
  
  // Government oversight
  MINISTRY_PERSONNEL: 'ministry_personnel',
  SECTOR_ADVISOR: 'sector_advisor',
  
  // Committee members
  COMMITTEE_MEMBER: 'committee_member',
  COMMITTEE_CHAIR: 'committee_chair'
} as const;

// 29 Economic Sectors (identified in CPE program)
export const ECONOMIC_SECTORS = [
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
] as const;

// Funding Priority Sectors (75% funding rate)
export const PRIORITY_FUNDING_SECTORS = {
  DIGITAL_TRANSFORMATION: 'digital_transformation_productivity',
  EXPERIENCED_WORKERS: 'experienced_workers',
  COMMUNITY_SECTOR: 'community_sector', 
  INFORMATION_TECHNOLOGY: 'information_technology',
  GREEN_ECONOMY: 'green_economy_plan'
} as const;

// Organization Types (eligibility)
export const ORGANIZATION_TYPES = {
  // Eligible with priority
  SME_PRIORITY: 'sme_6_99_employees', // Priority target
  
  // Standard eligible
  PRIVATE_ENTERPRISE: 'private_enterprise',
  WORKER_ASSOCIATION: 'worker_association',
  EMPLOYER_ASSOCIATION: 'employer_association',
  PROFESSIONAL_ASSOCIATION: 'professional_association',
  NON_PROFIT: 'non_profit_organization',
  COOPERATIVE: 'cooperative',
  INDEPENDENT_WORKER: 'independent_worker',
  EMPLOYER_GROUP: 'employer_group',
  WORKER_GROUP: 'worker_group',
  TRAINING_ESTABLISHMENT: 'training_establishment',
  MUNICIPAL_ADMIN: 'municipal_administration',
  BAND_COUNCIL: 'band_council',
  
  // Excluded from own HR needs
  MUNICIPAL_ADMIN_OWN: 'municipal_admin_own_hr',
  PARAPUBLIC_PROVINCIAL: 'parapublic_provincial',
  PARAPUBLIC_FEDERAL: 'parapublic_federal',
  PRIVATE_TRAINING: 'private_training_own_hr',
  HEALTH_SERVICES: 'health_social_services_own_hr',
  BAND_COUNCIL_OWN: 'band_council_own_hr'
} as const;

// Content Structure for Courses
export interface CourseStructure {
  id: string;
  title: string;
  description: string;
  category: typeof INTERVENTION_CATEGORIES[keyof typeof INTERVENTION_CATEGORIES];
  interventionType: string;
  sector?: typeof ECONOMIC_SECTORS[number];
  targetRoles: (typeof USER_ROLES[keyof typeof USER_ROLES])[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // in hours
  language: 'fr' | 'en' | 'bilingual';
  prerequisites?: string[];
  learningObjectives: string[];
  competencies: string[];
  assessmentType: 'diagnostic' | 'formative' | 'certification' | 'practical';
  hasCertification: boolean;
  fundingEligible: boolean;
  priorityFunding?: typeof PRIORITY_FUNDING_SECTORS[keyof typeof PRIORITY_FUNDING_SECTORS];
  consultationRequired: boolean; // Committee involvement needed
  collaborationTools: string[]; // Tools needed for committee work
}

// Committee Structure for Consultation
export interface ConsultationCommittee {
  id: string;
  name: string;
  type: 'enterprise' | 'sectoral' | 'ad_hoc' | 'advisory';
  sector?: typeof ECONOMIC_SECTORS[number];
  organizationId: string;
  chairperson: string; // User ID
  members: {
    userId: string;
    role: typeof USER_ROLES[keyof typeof USER_ROLES];
    organization?: string;
  }[];
  projects: string[]; // Associated project IDs
  meetingSchedule: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'ad_hoc';
    nextMeeting?: Date;
  };
  status: 'active' | 'inactive' | 'completed';
  mandateStartDate: Date;
  mandateEndDate?: Date;
  objectives: string[];
  deliverables: string[];
}

// Project Structure for CPE Interventions
export interface CPEProject {
  id: string;
  title: string;
  description: string;
  category: typeof INTERVENTION_CATEGORIES[keyof typeof INTERVENTION_CATEGORIES];
  interventionType: string;
  organizationId: string;
  organizationType: typeof ORGANIZATION_TYPES[keyof typeof ORGANIZATION_TYPES];
  sector: typeof ECONOMIC_SECTORS[number];
  
  // Financial information
  totalBudget: number;
  ministryContribution: number;
  fundingRate: number; // 50%, 75%, etc.
  prioritySector?: typeof PRIORITY_FUNDING_SECTORS[keyof typeof PRIORITY_FUNDING_SECTORS];
  
  // Timeline
  startDate: Date;
  endDate: Date;
  duration: number; // in months (max 12, extendable to 36)
  
  // Team
  projectCoordinator: string; // User ID
  consultants: string[]; // User IDs
  committeeId?: string;
  
  // Content & Training
  courses: string[]; // Course IDs
  assessments: string[]; // Assessment IDs
  
  // Status & Progress
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  progress: number; // 0-100%
  objectives: string[];
  deliverables: string[];
  outcomes: string[];
  
  // Compliance & Reporting
  reportingFrequency: 'monthly' | 'quarterly' | 'final';
  lastReport?: Date;
  nextReportDue?: Date;
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
}

// Assessment & Diagnostic Tools
export interface AssessmentTool {
  id: string;
  name: string;
  type: 'hr_diagnostic' | 'skills_gap' | 'productivity_analysis' | 'organizational_assessment';
  category: typeof INTERVENTION_CATEGORIES[keyof typeof INTERVENTION_CATEGORIES];
  targetRoles: (typeof USER_ROLES[keyof typeof USER_ROLES])[];
  questions: {
    id: string;
    text: string;
    type: 'multiple_choice' | 'scale' | 'text' | 'file_upload';
    options?: string[];
    required: boolean;
    weight: number;
  }[];
  scoringCriteria: {
    dimension: string;
    weight: number;
    benchmarks: {
      score: number;
      label: string;
      recommendations: string[];
    }[];
  }[];
  reportTemplate: string;
  recommendationEngine: {
    rules: {
      condition: string;
      recommendation: string;
      courses?: string[]; // Suggested courses
      interventions?: string[]; // Suggested intervention types
    }[];
  };
}

// Certification Pathways
export interface CertificationPathway {
  id: string;
  name: string;
  description: string;
  category: typeof INTERVENTION_CATEGORIES[keyof typeof INTERVENTION_CATEGORIES];
  targetRole: typeof USER_ROLES[keyof typeof USER_ROLES];
  
  // Requirements
  prerequisites: string[];
  requiredCourses: string[];
  optionalCourses: string[];
  requiredAssessments: string[];
  minimumExperience?: number; // in months
  
  // Certification details  
  validityPeriod: number; // in months
  renewalRequirements: string[];
  issuingAuthority: string;
  recognizedBy: string[];
  
  // Progress tracking
  stages: {
    id: string;
    name: string;
    requirements: string[];
    order: number;
  }[];
}
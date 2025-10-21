// @ts-nocheck
import { z } from 'zod'

// Base validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format')
export const emailSchema = z.string().email('Invalid email format')
export const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug cannot exceed 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name cannot exceed 100 characters'),
  slug: slugSchema,
  type: z.enum(['enterprise', 'education', 'government', 'nonprofit'], {
    errorMap: () => ({ message: 'Invalid organization type' })
  }),
  project_code: z.string()
    .min(2, 'Project code must be at least 2 characters')
    .max(20, 'Project code cannot exceed 20 characters')
    .optional(),
  billing_email: emailSchema.optional(),
  settings: z.record(z.any()).optional()
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

// User registration schemas
export const createUserProfileSchema = z.object({
  email: emailSchema,
  full_name: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  organization_id: uuidSchema.optional(),
  preferred_locale: z.enum(['en', 'fr']).default('en'),
  phone: z.string()
    .regex(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional(),
  timezone: z.string().max(50, 'Timezone cannot exceed 50 characters').optional(),
  preferences: z.record(z.any()).optional()
})

export const updateUserProfileSchema = createUserProfileSchema
  .omit({ email: true })
  .partial()

// Course enrollment schemas
export const enrollUserSchema = z.object({
  user_id: uuidSchema,
  course_id: uuidSchema,
  enrollment_type: z.enum(['self', 'assigned', 'required']).default('self'),
  due_date: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
})

export const updateEnrollmentSchema = z.object({
  status: z.enum(['enrolled', 'in_progress', 'completed', 'withdrawn']),
  progress_percentage: z.number().min(0).max(100).optional(),
  completion_date: z.string().datetime().optional(),
  certificate_issued: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
})

// Course management schemas
export const createCourseSchema = z.object({
  title_en: z.string()
    .min(5, 'Course title (English) must be at least 5 characters')
    .max(200, 'Course title (English) cannot exceed 200 characters'),
  title_fr: z.string()
    .min(5, 'Course title (French) must be at least 5 characters')
    .max(200, 'Course title (French) cannot exceed 200 characters'),
  description_en: z.string()
    .min(10, 'Course description (English) must be at least 10 characters')
    .max(2000, 'Course description (English) cannot exceed 2000 characters')
    .optional(),
  description_fr: z.string()
    .min(10, 'Course description (French) must be at least 10 characters')
    .max(2000, 'Course description (French) cannot exceed 2000 characters')
    .optional(),
  duration_minutes: z.number()
    .min(1, 'Course duration must be at least 1 minute')
    .max(10080, 'Course duration cannot exceed 7 days (10080 minutes)'),
  cpe_credits: z.number()
    .min(0, 'CPE credits cannot be negative')
    .max(40, 'CPE credits cannot exceed 40')
    .optional(),
  category: z.string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category cannot exceed 50 characters')
    .optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string().max(30, 'Tag cannot exceed 30 characters')).optional(),
  prerequisites: z.array(uuidSchema).optional(),
  learning_objectives: z.array(z.string().max(200, 'Learning objective cannot exceed 200 characters')).optional()
})

export const updateCourseSchema = createCourseSchema.partial()

// Certificate generation schemas
export const generateCertificateSchema = z.object({
  enrollment_id: uuidSchema,
  template_id: z.string().optional(),
  issue_date: z.string().datetime().optional(),
  expiry_date: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
})

// Module schemas
export const createModuleSchema = z.object({
  course_id: uuidSchema,
  title_en: z.string()
    .min(3, 'Module title (English) must be at least 3 characters')
    .max(200, 'Module title (English) cannot exceed 200 characters'),
  title_fr: z.string()
    .min(3, 'Module title (French) must be at least 3 characters')
    .max(200, 'Module title (French) cannot exceed 200 characters'),
  order_index: z.number().min(0, 'Order index cannot be negative'),
  video_url: z.string().url('Invalid video URL').optional(),
  content_en: z.string().max(10000, 'Content (English) cannot exceed 10000 characters').optional(),
  content_fr: z.string().max(10000, 'Content (French) cannot exceed 10000 characters').optional(),
  duration_minutes: z.number()
    .min(1, 'Module duration must be at least 1 minute')
    .max(480, 'Module duration cannot exceed 8 hours (480 minutes)'),
  is_required: z.boolean().default(true),
  resources: z.array(z.object({
    title: z.string().max(100, 'Resource title cannot exceed 100 characters'),
    url: z.string().url('Invalid resource URL'),
    type: z.enum(['pdf', 'video', 'link', 'document'])
  })).optional()
})

export const updateModuleSchema = createModuleSchema
  .omit({ course_id: true })
  .partial()

// Assessment schemas
export const createAssessmentSchema = z.object({
  course_id: uuidSchema.optional(),
  module_id: uuidSchema.optional(),
  title_en: z.string()
    .min(5, 'Assessment title (English) must be at least 5 characters')
    .max(200, 'Assessment title (English) cannot exceed 200 characters'),
  title_fr: z.string()
    .min(5, 'Assessment title (French) must be at least 5 characters')
    .max(200, 'Assessment title (French) cannot exceed 200 characters'),
  description_en: z.string().max(1000, 'Description (English) cannot exceed 1000 characters').optional(),
  description_fr: z.string().max(1000, 'Description (French) cannot exceed 1000 characters').optional(),
  type: z.enum(['quiz', 'assignment', 'discussion', 'practical']),
  passing_score: z.number().min(0).max(100).default(70),
  max_attempts: z.number().min(1).max(10).default(3),
  time_limit_minutes: z.number().min(1).max(480).optional(),
  is_mandatory: z.boolean().default(true),
  randomize_questions: z.boolean().default(false),
  show_results_immediately: z.boolean().default(true)
}).refine(
  data => data.course_id || data.module_id,
  { message: 'Assessment must belong to either a course or a module' }
)

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }).optional(),
  message: z.string().optional(),
  pagination: z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
    total: z.number().min(0),
    pages: z.number().min(0)
  }).optional()
})

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

export const courseFilterSchema = paginationSchema.extend({
  search: z.string().max(100, 'Search term cannot exceed 100 characters').optional(),
  category: z.string().max(50, 'Category cannot exceed 50 characters').optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  published: z.coerce.boolean().optional(),
  tags: z.string().optional() // Comma-separated tags
})

export const userFilterSchema = paginationSchema.extend({
  search: z.string().max(100, 'Search term cannot exceed 100 characters').optional(),
  role: z.enum(['admin', 'instructor', 'learner']).optional(),
  organization_id: uuidSchema.optional(),
  active: z.coerce.boolean().optional()
})

export const enrollmentFilterSchema = paginationSchema.extend({
  user_id: uuidSchema.optional(),
  course_id: uuidSchema.optional(),
  status: z.enum(['enrolled', 'in_progress', 'completed', 'withdrawn']).optional(),
  enrollment_type: z.enum(['self', 'assigned', 'required']).optional(),
  from_date: z.string().datetime().optional(),
  to_date: z.string().datetime().optional()
})

// Export types for TypeScript usage
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type CreateUserProfileInput = z.infer<typeof createUserProfileSchema>
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
export type EnrollUserInput = z.infer<typeof enrollUserSchema>
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>
export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type GenerateCertificateInput = z.infer<typeof generateCertificateSchema>
export type CreateModuleInput = z.infer<typeof createModuleSchema>
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>
export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type CourseFilterInput = z.infer<typeof courseFilterSchema>
export type UserFilterInput = z.infer<typeof userFilterSchema>
export type EnrollmentFilterInput = z.infer<typeof enrollmentFilterSchema>
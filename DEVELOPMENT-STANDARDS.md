# 📋 CPE CONNECT - DEVELOPMENT STANDARDS & BEST PRACTICES

## 🎯 **OVERVIEW**

This document establishes world-class development standards, coding conventions, and best practices for the CPE Connect platform development team. These guidelines ensure code quality, maintainability, security, and team collaboration throughout the 6-phase implementation.

---

# 📝 **CODING STANDARDS**

## **TypeScript Guidelines**

### **Type Safety Standards**
```typescript
// ✅ GOOD: Strict type definitions
interface CourseData {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly organizationId: string
  readonly modules: readonly Module[]
  readonly createdAt: Date
  readonly updatedAt: Date
}

// ✅ GOOD: Utility types for API responses
type CreateCourseRequest = Omit<CourseData, 'id' | 'createdAt' | 'updatedAt'>
type UpdateCourseRequest = Partial<CreateCourseRequest>

// ❌ BAD: Using 'any' type
const courseData: any = getCourseData()
```

### **Naming Conventions**
```typescript
// ✅ GOOD: Clear, descriptive names
const calculateCourseCompletionPercentage = (progress: UserProgress): number => {}
const isUserEnrolledInCourse = (userId: string, courseId: string): boolean => {}

// Component naming (PascalCase)
const CourseProgressIndicator: React.FC<Props> = () => {}

// Hook naming (camelCase with 'use' prefix)
const useEnrollmentStatus = (courseId: string) => {}

// Constant naming (SCREAMING_SNAKE_CASE)
const MAX_COURSE_ENROLLMENT_LIMIT = 100
const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
```

## **React/Next.js Best Practices**

### **Component Structure Standards**
```typescript
// ✅ GOOD: Well-structured component
interface CourseCardProps {
  readonly course: Course
  readonly onEnroll?: (courseId: string) => void
  readonly className?: string
}

export const CourseCard: React.FC<CourseCardProps> = ({ 
  course, 
  onEnroll, 
  className 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleEnrollClick = useCallback(async () => {
    if (!onEnroll) return
    
    setIsLoading(true)
    try {
      await onEnroll(course.id)
    } catch (error) {
      console.error('Enrollment failed:', error)
    } finally {
      setIsLoading(false)
    }
  }, [course.id, onEnroll])

  return (
    <Card className={cn('course-card', className)}>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{course.description}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleEnrollClick} 
          disabled={isLoading}
          loading={isLoading}
        >
          Enroll Now
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### **Custom Hook Standards**
```typescript
// ✅ GOOD: Reusable, well-typed hooks
export const useCourseEnrollment = (courseId: string) => {
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>('not-enrolled')
  const [error, setError] = useState<string | null>(null)
  
  const enroll = useCallback(async () => {
    try {
      setEnrollmentStatus('enrolling')
      await enrollInCourse(courseId)
      setEnrollmentStatus('enrolled')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setEnrollmentStatus('not-enrolled')
    }
  }, [courseId])

  const unenroll = useCallback(async () => {
    // Implementation
  }, [courseId])

  return {
    enrollmentStatus,
    error,
    enroll,
    unenroll,
    isEnrolled: enrollmentStatus === 'enrolled',
    isLoading: enrollmentStatus === 'enrolling'
  }
}
```

## **API Development Standards**

### **Route Handler Structure**
```typescript
// ✅ GOOD: Structured API route with proper error handling
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimiter } from '@/lib/rate-limit'

const CreateCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  organizationId: z.string().uuid()
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimiter.check(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Authentication check
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (!user || authError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Request validation
    const body = await request.json()
    const validatedData = CreateCourseSchema.parse(body)

    // Authorization check
    const hasPermission = await checkUserPermission(
      user.id, 
      validatedData.organizationId, 
      'course:create'
    )
    
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Business logic
    const course = await createCourse({
      ...validatedData,
      createdBy: user.id
    })

    return NextResponse.json(
      { data: course },
      { status: 201 }
    )

  } catch (error) {
    console.error('Course creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

# 🔒 **SECURITY BEST PRACTICES**

## **Input Validation & Sanitization**

### **Zod Schema Validation**
```typescript
// ✅ GOOD: Comprehensive validation schemas
const UserProfileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces allowed'),
  
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .transform(email => email.trim()),
  
  organizationId: z.string()
    .uuid('Invalid organization ID'),
  
  role: z.enum(['admin', 'instructor', 'student']),
  
  metadata: z.record(z.unknown()).optional()
})

// Custom validation for business rules
const EnrollmentSchema = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid()
}).refine(async (data) => {
  const isEligible = await checkEnrollmentEligibility(data.userId, data.courseId)
  return isEligible
}, {
  message: 'User not eligible for course enrollment'
})
```

### **SQL Injection Prevention**
```typescript
// ✅ GOOD: Using Supabase client with parameterized queries
const getUserCourses = async (userId: string, organizationId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      course_id,
      courses (
        title,
        description,
        status
      )
    `)
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
  
  if (error) throw new Error('Failed to fetch user courses')
  return data
}

// ❌ BAD: String concatenation (vulnerable to injection)
const query = `SELECT * FROM courses WHERE user_id = '${userId}'`
```

## **Authentication & Authorization**

### **JWT Token Validation**
```typescript
// ✅ GOOD: Proper token validation middleware
export const authenticateUser = async (request: NextRequest) => {
  const supabase = createServerClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user || error) {
    throw new AuthenticationError('Invalid or expired token')
  }
  
  // Additional user validation
  const profile = await getUserProfile(user.id)
  if (!profile || profile.status !== 'active') {
    throw new AuthenticationError('User account inactive')
  }
  
  return { user, profile }
}
```

### **Role-Based Access Control**
```typescript
// ✅ GOOD: Granular permission checking
const checkPermission = async (
  userId: string, 
  organizationId: string, 
  action: string
): Promise<boolean> => {
  const userRoles = await getUserRoles(userId, organizationId)
  
  for (const role of userRoles) {
    const permissions = await getRolePermissions(role.name)
    if (permissions.includes(action)) {
      return true
    }
  }
  
  return false
}

// Usage in API routes
const canCreateCourse = await checkPermission(
  user.id, 
  organizationId, 
  'course:create'
)
```

---

# 🧪 **TESTING STANDARDS**

## **Unit Testing Guidelines**

### **Component Testing**
```typescript
// ✅ GOOD: Comprehensive component tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { CourseCard } from './CourseCard'

const mockCourse: Course = {
  id: '123',
  title: 'Test Course',
  description: 'Test Description',
  organizationId: 'org-123',
  createdAt: new Date(),
  updatedAt: new Date()
}

describe('CourseCard', () => {
  it('renders course information correctly', () => {
    render(<CourseCard course={mockCourse} />)
    
    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('calls onEnroll when enroll button is clicked', async () => {
    const mockOnEnroll = vi.fn()
    render(<CourseCard course={mockCourse} onEnroll={mockOnEnroll} />)
    
    const enrollButton = screen.getByText('Enroll Now')
    fireEvent.click(enrollButton)
    
    expect(mockOnEnroll).toHaveBeenCalledWith('123')
  })

  it('shows loading state during enrollment', async () => {
    const mockOnEnroll = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    render(<CourseCard course={mockCourse} onEnroll={mockOnEnroll} />)
    
    const enrollButton = screen.getByText('Enroll Now')
    fireEvent.click(enrollButton)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })
})
```

### **API Route Testing**
```typescript
// ✅ GOOD: API endpoint testing
import { POST } from '../route'
import { NextRequest } from 'next/server'

describe('/api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates course with valid data', async () => {
    const requestBody = {
      title: 'New Course',
      description: 'Course Description',
      organizationId: 'org-123'
    }

    const request = new NextRequest('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.data).toHaveProperty('id')
    expect(data.data.title).toBe('New Course')
  })

  it('returns 400 for invalid data', async () => {
    const requestBody = {
      title: '', // Invalid: empty title
      description: 'Course Description',
      organizationId: 'invalid-id' // Invalid: not a UUID
    }

    const request = new NextRequest('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })

    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})
```

## **End-to-End Testing**

### **Playwright Test Structure**
```typescript
// ✅ GOOD: E2E user journey testing
import { test, expect } from '@playwright/test'

test.describe('Course Enrollment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated user session
    await page.goto('/login')
    await page.fill('[data-testid=email]', 'test@example.com')
    await page.fill('[data-testid=password]', 'password123')
    await page.click('[data-testid=login-button]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('user can enroll in available course', async ({ page }) => {
    // Navigate to course catalog
    await page.click('[data-testid=courses-nav]')
    await expect(page).toHaveURL('/courses')

    // Find and click on a course
    await page.click('[data-testid=course-card]:first-child')
    
    // Enroll in course
    await page.click('[data-testid=enroll-button]')
    
    // Verify enrollment confirmation
    await expect(page.locator('[data-testid=enrollment-success]')).toBeVisible()
    
    // Verify course appears in user's enrolled courses
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid=enrolled-courses]')).toContainText('Test Course')
  })

  test('user cannot enroll in course without prerequisites', async ({ page }) => {
    await page.goto('/courses/advanced-course')
    
    const enrollButton = page.locator('[data-testid=enroll-button]')
    await expect(enrollButton).toBeDisabled()
    
    await expect(page.locator('[data-testid=prerequisites-warning]')).toBeVisible()
  })
})
```

---

# 📁 **PROJECT STRUCTURE STANDARDS**

## **Directory Organization**

```
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route groups
│   ├── [locale]/                 # Dynamic routes
│   ├── api/                      # API routes
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   ├── forms/                    # Form components
│   ├── charts/                   # Data visualization
│   └── layout/                   # Layout components
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts              # Authentication hooks
│   ├── use-courses.ts           # Course-related hooks
│   └── use-local-storage.ts     # Utility hooks
├── lib/                          # Utility libraries
│   ├── supabase/                # Supabase clients
│   ├── utils/                   # Helper functions
│   ├── validations/             # Zod schemas
│   └── constants.ts             # Application constants
├── types/                        # TypeScript type definitions
│   ├── database.ts              # Generated database types
│   ├── auth.ts                  # Authentication types
│   └── api.ts                   # API response types
├── __tests__/                    # Test files
│   ├── components/              # Component tests
│   ├── hooks/                   # Hook tests
│   ├── api/                     # API tests
│   └── e2e/                     # E2E tests
└── docs/                         # Project documentation
```

## **File Naming Conventions**

### **Component Files**
```
✅ GOOD:
- CourseCard.tsx
- UserProfile.tsx
- NavigationMenu.tsx

❌ BAD:
- coursecard.tsx
- userProfile.tsx
- navigation-menu.tsx
```

### **Utility Files**
```
✅ GOOD:
- format-date.ts
- calculate-progress.ts
- validate-email.ts

❌ BAD:
- formatDate.ts
- calculateProgress.ts
- validateEmail.ts
```

### **Test Files**
```
✅ GOOD:
- CourseCard.test.tsx
- use-auth.test.ts
- course-enrollment.e2e.ts

✅ ALSO GOOD:
- CourseCard.spec.tsx
- use-auth.spec.ts
- course-enrollment.spec.ts
```

---

# 🔄 **GIT WORKFLOW STANDARDS**

## **Branch Naming Convention**

### **Feature Branches**
```
feature/phase-1/authentication-system
feature/phase-2/course-player-ui
feature/phase-3/assessment-engine
hotfix/login-error-handling
bugfix/course-enrollment-validation
```

### **Commit Message Format**
```
✅ GOOD:
feat(auth): implement multi-factor authentication
fix(api): resolve course enrollment validation error
docs(readme): update installation instructions
test(components): add CourseCard component tests
refactor(hooks): optimize useCourseData performance

❌ BAD:
added authentication
fixed bug
updated files
```

## **Pull Request Standards**

### **PR Template**
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated and passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing completed

## Security
- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authorization checks in place
- [ ] Dependencies scanned for vulnerabilities

## Performance
- [ ] No performance regressions
- [ ] Bundle size impact acceptable
- [ ] Database queries optimized

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Accessibility standards met
```

---

# 📋 **CODE REVIEW CHECKLIST**

## **Functionality Review**
- [ ] Code meets requirements and acceptance criteria
- [ ] Edge cases and error scenarios handled
- [ ] User experience is intuitive and accessible
- [ ] Performance impact is acceptable

## **Code Quality Review**
- [ ] Code is readable and well-documented
- [ ] Naming conventions followed
- [ ] No code duplication or redundancy
- [ ] Appropriate design patterns used

## **Security Review**
- [ ] Input validation implemented
- [ ] Authentication/authorization checks present
- [ ] No sensitive data exposed
- [ ] SQL injection prevention in place

## **Testing Review**
- [ ] Adequate test coverage (>90%)
- [ ] Tests are meaningful and comprehensive
- [ ] Integration tests cover critical paths
- [ ] E2E tests validate user workflows

---

# 🚀 **DEPLOYMENT STANDARDS**

## **Environment Configuration**

### **Development Environment**
```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
NODE_ENV=development
```

### **Production Environment**
```typescript
// .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NODE_ENV=production
SENTRY_DSN=your-sentry-dsn
```

## **Build Standards**

### **Next.js Configuration**
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

# 📊 **PERFORMANCE STANDARDS**

## **Frontend Performance Targets**

### **Core Web Vitals**
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1

### **Bundle Size Targets**
- **Initial bundle size**: < 250KB gzipped
- **Page-level bundles**: < 100KB gzipped
- **Third-party scripts**: Minimized and optimized

## **Backend Performance Targets**

### **API Response Times**
- **Database queries**: < 50ms average
- **API endpoints**: < 200ms average
- **File uploads**: Progress indication for >1MB files

### **Database Performance**
```sql
-- Performance monitoring queries
EXPLAIN ANALYZE SELECT * FROM courses 
WHERE organization_id = $1 AND status = 'active';

-- Index usage verification
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'courses';
```

---

# ✅ **QUALITY ASSURANCE CHECKLIST**

## **Pre-Development Checklist**
- [ ] Requirements clearly defined and understood
- [ ] Technical design reviewed and approved
- [ ] Test cases planned and documented
- [ ] Security requirements identified

## **Development Checklist**
- [ ] Code follows established patterns and standards
- [ ] Unit tests written and passing
- [ ] Integration tests covering critical paths
- [ ] Code review completed by senior developer

## **Pre-Deployment Checklist**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security scan completed with no critical issues
- [ ] Performance benchmarks met
- [ ] Accessibility audit completed
- [ ] Documentation updated
- [ ] Deployment plan reviewed and approved

## **Post-Deployment Checklist**
- [ ] Monitoring alerts configured
- [ ] Error tracking operational
- [ ] Performance metrics baseline established
- [ ] User feedback collection active

---

**🏆 WORLD-CLASS DEVELOPMENT STANDARDS ESTABLISHED**  
*These standards ensure the CPE Connect platform will be built with enterprise-grade quality, security, and maintainability.*
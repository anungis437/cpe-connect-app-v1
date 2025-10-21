# API Documentation

## Authentication

All API endpoints require authentication via Supabase Auth. The session cookie is automatically included in requests.

### Headers

```
Authorization: Bearer <supabase-access-token>
Content-Type: application/json
```

## Endpoints

### Enrollment

#### POST `/api/enroll`

Enroll the current user in a course.

**Request Body:**
```json
{
  "courseId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "enrollment": {
    "id": "uuid",
    "user_id": "uuid",
    "course_id": "uuid",
    "enrolled_at": "2024-01-01T00:00:00Z",
    "progress_percentage": 0
  }
}
```

**Errors:**
- `401` - Unauthorized
- `400` - Already enrolled
- `500` - Server error

---

### Module Completion

#### POST `/api/complete-module`

Mark a module as completed and update progress.

**Request Body:**
```json
{
  "enrollmentId": "uuid",
  "moduleId": "uuid",
  "quizScore": 85
}
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "id": "uuid",
    "enrollment_id": "uuid",
    "module_id": "uuid",
    "completed": true,
    "quiz_score": 85,
    "completed_at": "2024-01-01T00:00:00Z"
  },
  "progressPercentage": 50
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Enrollment not found
- `500` - Server error

---

### Certificate Generation

#### POST `/api/generate-certificate`

Generate a certificate for a completed course.

**Request Body:**
```json
{
  "enrollmentId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "certificateUrl": "https://supabase.co/storage/certificates/..."
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Enrollment not found
- `400` - Course not completed (progress < 100%)
- `500` - Server error

---

### Artifact Upload

#### POST `/api/upload-artifact`

Upload a course artifact (evidence file).

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `file`: File (max 10MB)
  - `enrollmentId`: string (UUID)

**Response:**
```json
{
  "success": true,
  "artifact": {
    "id": "uuid",
    "enrollment_id": "uuid",
    "file_name": "document.pdf",
    "file_url": "artifacts/...",
    "file_type": "application/pdf",
    "uploaded_at": "2024-01-01T00:00:00Z"
  },
  "url": "https://supabase.co/storage/artifacts/..."
}
```

**Errors:**
- `401` - Unauthorized
- `400` - Missing file or enrollmentId
- `404` - Enrollment not found
- `500` - Server error

---

### Create Profile

#### POST `/api/create-profile`

Create a user profile (used during signup).

**Request Body:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "fullName": "John Doe",
  "locale": "en"
}
```

**Response:**
```json
{
  "success": true
}
```

**Errors:**
- `500` - Server error

---

## Database Queries

### Get User Enrollments

```typescript
const { data: enrollments } = await supabase
  .from('enrollments')
  .select(`
    *,
    course:courses(*)
  `)
  .eq('user_id', userId)
```

### Get Course with Modules

```typescript
const { data: course } = await supabase
  .from('courses')
  .select(`
    *,
    modules(*)
  `)
  .eq('id', courseId)
  .single()
```

### Get Module Progress

```typescript
const { data: progress } = await supabase
  .from('module_progress')
  .select('*')
  .eq('enrollment_id', enrollmentId)
```

### Get User Artifacts

```typescript
const { data: artifacts } = await supabase
  .from('artifacts')
  .select('*')
  .eq('enrollment_id', enrollmentId)
```

## Storage

### Upload File

```typescript
const { error } = await supabase.storage
  .from('artifacts')
  .upload(fileName, file)
```

### Get Public URL

```typescript
const { data } = supabase.storage
  .from('artifacts')
  .getPublicUrl(fileName)
```

### Download File

```typescript
const { data } = await supabase.storage
  .from('artifacts')
  .download(fileName)
```

## Email Functions

### Send Enrollment Email

```typescript
await sendEnrollmentEmail(
  email: string,
  userName: string,
  courseName: string,
  locale: 'en' | 'fr'
)
```

### Send Certificate Email

```typescript
await sendCertificateEmail(
  email: string,
  userName: string,
  courseName: string,
  certificateUrl: string,
  locale: 'en' | 'fr'
)
```

### Send Reminder Email

```typescript
await sendReminderEmail(
  email: string,
  userName: string,
  courseName: string,
  locale: 'en' | 'fr'
)
```

## PDF Generation

### Generate Certificate

```typescript
const pdfBuffer = await generateCertificatePDF({
  userName: string,
  courseName: string,
  completionDate: string,
  certificateId: string,
  locale: 'en' | 'fr'
})
```

### Upload Certificate

```typescript
const certificateUrl = await uploadCertificate(
  userId: string,
  courseId: string,
  pdfBuffer: Buffer
)
```

## Power BI Integration

### Sync Enrollment Data

```typescript
const powerBIService = new PowerBIService()
await powerBIService.syncEnrollmentData(enrollments)
```

## Artifact Management

### Generate Evidence ZIP

```typescript
const zipBuffer = await generateEvidenceZip(enrollmentId)
```

### Upload Artifact

```typescript
const artifactUrl = await uploadArtifact(enrollmentId, file)
```

## Rate Limits

- API endpoints: 100 requests per minute per user
- File uploads: 10MB max file size
- Storage: Limited by Supabase plan

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Best Practices

1. Always check for errors in responses
2. Use TypeScript types for type safety
3. Handle loading and error states in UI
4. Validate user input before sending
5. Use optimistic updates where appropriate
6. Cache frequently accessed data
7. Use pagination for large datasets
8. Implement proper error boundaries

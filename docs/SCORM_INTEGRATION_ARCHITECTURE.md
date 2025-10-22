# SCORM Integration Architecture for CPE Academy

## Overview
This document outlines the architecture for SCORM (Sharable Content Object Reference Model) integration, enabling CPE Academy to connect with major enterprise LMS platforms like BrainTree, Moodle, Blackboard, Canvas, and others.

## SCORM Standards Support

### SCORM Versions
- **SCORM 1.2** (Legacy support for older systems)
- **SCORM 2004 4th Edition** (Most widely adopted)
- **xAPI (Tin Can API)** (Next-generation learning analytics)
- **CMI5** (Modern successor to SCORM)

### Content Packaging
- **Content Aggregation Model (CAM)** - Package structure
- **Run-Time Environment (RTE)** - Player communication
- **Sequencing and Navigation (SN)** - Learning flow control

## Database Schema Extensions

### SCORM Package Management
```sql
-- SCORM Packages table
CREATE TABLE scorm_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  scorm_version TEXT NOT NULL CHECK (scorm_version IN ('1.2', '2004', 'xapi', 'cmi5')),
  package_identifier TEXT NOT NULL UNIQUE,
  manifest_xml TEXT NOT NULL,
  launch_url TEXT NOT NULL,
  package_size BIGINT,
  upload_path TEXT NOT NULL,
  metadata JSONB,
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
  completion_status TEXT DEFAULT 'incomplete' CHECK (completion_status IN ('incomplete', 'completed', 'passed', 'failed')),
  success_status TEXT DEFAULT 'unknown' CHECK (success_status IN ('passed', 'failed', 'unknown')),
  score_raw DECIMAL(5,2),
  score_min DECIMAL(5,2),
  score_max DECIMAL(5,2),
  total_time INTERVAL,
  location TEXT,
  suspend_data TEXT,
  exit_reason TEXT,
  is_active BOOLEAN DEFAULT true
);

-- SCORM Interactions (for detailed tracking)
CREATE TABLE scorm_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES scorm_sessions(id) ON DELETE CASCADE,
  interaction_id TEXT NOT NULL,
  interaction_type TEXT,
  learner_response TEXT,
  result TEXT,
  latency INTERVAL,
  timestamp_utc TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  objectives JSONB,
  correct_responses JSONB
);

-- External LMS Integration
CREATE TABLE lms_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lms_type TEXT NOT NULL CHECK (lms_type IN ('moodle', 'canvas', 'blackboard', 'braintree', 'brightspace', 'schoology', 'custom')),
  lms_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  api_credentials JSONB, -- Encrypted
  sso_config JSONB,
  grade_passback_enabled BOOLEAN DEFAULT false,
  roster_sync_enabled BOOLEAN DEFAULT false,
  content_sharing_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grade Passback Tracking
CREATE TABLE grade_passback_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lms_integration_id UUID REFERENCES lms_integrations(id),
  external_assignment_id TEXT,
  grade_value DECIMAL(5,2),
  max_grade DECIMAL(5,2),
  passback_status TEXT DEFAULT 'pending' CHECK (passback_status IN ('pending', 'success', 'failed', 'retry')),
  error_message TEXT,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints for SCORM Integration

### SCORM Runtime API (JavaScript)
```javascript
// SCORM API Implementation
class SCORMAPIWrapper {
  constructor(version = '2004') {
    this.version = version;
    this.initialized = false;
    this.sessionId = null;
  }

  // SCORM 1.2 & 2004 Standard Functions
  Initialize(parameter) { /* Implementation */ }
  Terminate(parameter) { /* Implementation */ }
  GetValue(element) { /* Implementation */ }
  SetValue(element, value) { /* Implementation */ }
  Commit(parameter) { /* Implementation */ }
  GetLastError() { /* Implementation */ }
  GetErrorString(errorCode) { /* Implementation */ }
  GetDiagnostic(parameter) { /* Implementation */ }
}
```

### REST API Endpoints
```typescript
// SCORM Package Management
POST /api/scorm/packages/upload
GET /api/scorm/packages/{id}
DELETE /api/scorm/packages/{id}

// SCORM Runtime Communication
POST /api/scorm/sessions/initialize
PUT /api/scorm/sessions/{sessionId}/data
POST /api/scorm/sessions/{sessionId}/commit
POST /api/scorm/sessions/{sessionId}/terminate

// External LMS Integration
POST /api/integrations/lms/connect
GET /api/integrations/lms/{id}/sync
POST /api/integrations/lms/{id}/grade-passback
GET /api/integrations/lms/{id}/roster
```

## External LMS Platform Integrations

### 1. Moodle Integration
```typescript
interface MoodleConfig {
  baseUrl: string;
  token: string; // Web service token
  userId: number;
  courseId: number;
}

// Moodle Web Services API calls
- core_user_get_users
- core_course_get_courses
- core_grades_update_grades
- mod_scorm_insert_scorm_track
```

### 2. Canvas LTI Integration
```typescript
interface CanvasLTIConfig {
  consumerKey: string;
  sharedSecret: string;
  launchUrl: string;
  outcomeServiceUrl: string;
}

// Canvas API integration
- /api/v1/courses/{courseId}/assignments
- /api/v1/courses/{courseId}/gradebook
- /api/v1/users/{userId}/enrollments
```

### 3. Blackboard Learn Integration
```typescript
interface BlackboardConfig {
  hostname: string;
  applicationKey: string;
  applicationSecret: string;
  userContext: string;
}

// Blackboard REST API
- /learn/api/public/v1/courses
- /learn/api/public/v1/users
- /learn/api/public/v2/courses/{courseId}/gradebook/columns
```

### 4. BrainTree LMS Integration
```typescript
interface BrainTreeConfig {
  apiEndpoint: string;
  apiKey: string;
  organizationId: string;
  ssoConfig: {
    samlEndpoint: string;
    certificate: string;
  };
}
```

## File Structure for SCORM Support

```
/lib/scorm/
├── api/
│   ├── scorm-1.2-api.ts
│   ├── scorm-2004-api.ts
│   └── xapi-wrapper.ts
├── parsers/
│   ├── manifest-parser.ts
│   ├── imsmanifest-validator.ts
│   └── content-extractor.ts
├── players/
│   ├── scorm-player.tsx
│   ├── xapi-player.tsx
│   └── iframe-launcher.tsx
├── tracking/
│   ├── session-manager.ts
│   ├── progress-tracker.ts
│   └── grade-calculator.ts
└── integrations/
    ├── moodle-connector.ts
    ├── canvas-lti.ts
    ├── blackboard-api.ts
    └── generic-lms.ts

/components/scorm/
├── SCORMPlayer.tsx
├── SCORMUploader.tsx
├── IntegrationManager.tsx
└── GradePassbackPanel.tsx

/app/api/scorm/
├── upload/route.ts
├── sessions/route.ts
├── runtime/route.ts
└── integrations/route.ts
```

## SCORM Content Player Component

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'

interface SCORMPlayerProps {
  packageId: string
  enrollmentId: string
  onComplete?: (data: SCORMCompletionData) => void
  onProgress?: (progress: number) => void
}

export function SCORMPlayer({ 
  packageId, 
  enrollmentId, 
  onComplete, 
  onProgress 
}: SCORMPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [sessionId, setSessionId] = useState<string>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeSCORMSession()
  }, [packageId, enrollmentId])

  const initializeSCORMSession = async () => {
    try {
      const response = await fetch('/api/scorm/sessions/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageId, 
          enrollmentId,
          scormVersion: '2004'
        })
      })

      const session = await response.json()
      setSessionId(session.sessionId)

      // Inject SCORM API into iframe
      if (iframeRef.current) {
        iframeRef.current.onload = () => {
          injectSCORMAPI(session)
        }
      }
    } catch (error) {
      console.error('Failed to initialize SCORM session:', error)
    }
  }

  const injectSCORMAPI = (session: any) => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow) return

    // Create SCORM API object in iframe
    iframe.contentWindow.API_1484_11 = {
      Initialize: (param: string) => initializeSCORM(session),
      Terminate: (param: string) => terminateSCORM(session),
      GetValue: (element: string) => getSCORMValue(element, session),
      SetValue: (element: string, value: string) => setSCORMValue(element, value, session),
      Commit: (param: string) => commitSCORMData(session),
      GetLastError: () => getLastError(),
      GetErrorString: (errorCode: string) => getErrorString(errorCode),
      GetDiagnostic: (param: string) => getDiagnostic(param)
    }

    setLoading(false)
  }

  return (
    <div className="scorm-player-container h-full w-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading SCORM content...</p>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={`/api/scorm/launch/${sessionId}`}
        className="w-full h-full border-0"
        title="SCORM Content Player"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  )
}
```

## Integration Configuration Panel

```tsx
'use client'

interface LMSIntegrationPanelProps {
  organizationId: string
}

export function LMSIntegrationPanel({ organizationId }: LMSIntegrationPanelProps) {
  const [integrations, setIntegrations] = useState<LMSIntegration[]>([])
  const [selectedLMS, setSelectedLMS] = useState<string>('')

  const lmsOptions = [
    { id: 'moodle', name: 'Moodle', description: 'Open-source LMS platform' },
    { id: 'canvas', name: 'Canvas LMS', description: 'Instructure Canvas' },
    { id: 'blackboard', name: 'Blackboard Learn', description: 'Blackboard LMS' },
    { id: 'braintree', name: 'BrainTree LMS', description: 'BrainTree Learning Management' },
    { id: 'brightspace', name: 'D2L Brightspace', description: 'Desire2Learn Brightspace' },
    { id: 'schoology', name: 'Schoology', description: 'PowerSchool Schoology' },
    { id: 'custom', name: 'Custom LTI', description: 'Custom LTI 1.3 integration' }
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {lmsOptions.map(lms => (
          <Card key={lms.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {lms.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                {lms.name}
              </CardTitle>
              <CardDescription>{lms.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSelectedLMS(lms.id)}
              >
                Configure Integration
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Configuration Forms */}
      {selectedLMS && (
        <Card>
          <CardHeader>
            <CardTitle>Configure {lmsOptions.find(l => l.id === selectedLMS)?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <IntegrationConfigForm lmsType={selectedLMS} organizationId={organizationId} />
          </CardContent>
        </Card>
      )}

      {/* Existing Integrations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Integrations</h3>
        {integrations.map(integration => (
          <Card key={integration.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{integration.lms_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Last sync: {integration.last_sync_at ? 
                      new Date(integration.last_sync_at).toLocaleDateString() : 
                      'Never'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    integration.status === 'active' ? 'bg-green-100 text-green-800' :
                    integration.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {integration.status}
                  </span>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

## Implementation Priority

### Phase 1: SCORM Foundation
1. **Database schema updates** for SCORM support
2. **SCORM package uploader** and validator
3. **Basic SCORM player** with runtime API
4. **Session tracking** and progress monitoring

### Phase 2: LMS Integration Core
5. **LTI 1.3 standard implementation**
6. **Grade passback system**
7. **Moodle integration** (most common open-source)
8. **Canvas integration** (most common commercial)

### Phase 3: Enterprise Features
9. **SSO integration** with external LMS
10. **Roster synchronization**
11. **Advanced analytics** and reporting
12. **Custom branding** for white-label deployments

Would you like me to start implementing any specific part of this SCORM architecture? I'd recommend beginning with the database schema updates and basic SCORM package management system.
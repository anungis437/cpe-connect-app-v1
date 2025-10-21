# CPE Academy - Bilingual Self-Paced LMS

A comprehensive Learning Management System built with Next.js 14 and Supabase, designed for CPE Academy to deliver bilingual (English/French) self-paced training courses.

## Features

### Core Functionality
- ✅ **Bilingual Interface (FR/EN)** - Full support for French and English
- ✅ **Modular Video + Quiz Flow** - Structured learning modules with video content and interactive quizzes
- ✅ **Progress Tracking** - Real-time tracking of learner progress through courses
- ✅ **Certificate Generation** - Automatic PDF certificate generation with QR code verification
- ✅ **Artifact Upload** - Learners can upload course-related files and evidence
- ✅ **Evidence ZIP** - Automatic generation of ZIP archives containing all course artifacts
- ✅ **Power BI Integration** - Sync enrollment and progress data to Power BI for analytics
- ✅ **Email Automation** - Automated emails for enrollment, completion, and reminders
- ✅ **Row Level Security (RLS)** - Complete data isolation using Supabase RLS policies
- ✅ **Audit Logging** - Comprehensive audit trail of all user actions
- ✅ **Organization Linking** - Each learner linked to their CPE project organization

### Security & Compliance
- Row-Level Security (RLS) for complete data isolation
- Audit logging for all critical operations
- Secure authentication via Supabase Auth
- Compliant with CPE rules for targeted training

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Internationalization**: next-intl
- **PDF Generation**: pdfkit + qrcode
- **Email**: nodemailer
- **File Management**: archiver
- **Analytics**: Power BI integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- SMTP server for email (or use a service like SendGrid, Mailgun, etc.)
- Power BI workspace (optional, for analytics)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anungis437/cpe-connect-app-v1.git
   cd cpe-connect-app-v1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Email Configuration
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASSWORD=your-password
   SMTP_FROM=noreply@cpeacademy.com

   # Power BI Integration (optional)
   POWERBI_WORKSPACE_ID=your-workspace-id
   POWERBI_DATASET_ID=your-dataset-id
   POWERBI_CLIENT_ID=your-client-id
   POWERBI_CLIENT_SECRET=your-client-secret
   POWERBI_TENANT_ID=your-tenant-id

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase**

   a. Create a new Supabase project at https://supabase.com

   b. Run the database migration:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy the content from `supabase/migrations/20250101000000_initial_schema.sql`
   - Paste and execute the SQL

   c. Create storage buckets:
   - Go to Storage in Supabase dashboard
   - Create bucket named `certificates` (public)
   - Create bucket named `artifacts` (public)

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
cpe-connect-app-v1/
├── app/
│   ├── [locale]/           # Locale-based routes (en/fr)
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # User dashboard
│   │   ├── courses/        # Course pages
│   │   └── certificates/   # Certificate pages
│   ├── api/                # API routes
│   │   ├── enroll/         # Enrollment endpoint
│   │   ├── complete-module/# Module completion
│   │   ├── generate-certificate/
│   │   └── upload-artifact/
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # UI components
│   ├── auth/               # Auth components
│   ├── course/             # Course components
│   └── certificate/        # Certificate components
├── lib/
│   ├── supabase/           # Supabase client configs
│   ├── email/              # Email utilities
│   ├── pdf/                # PDF generation
│   ├── powerbi/            # Power BI integration
│   └── utils/              # Utility functions
├── messages/               # Internationalization files
│   ├── en.json             # English translations
│   └── fr.json             # French translations
├── supabase/
│   └── migrations/         # Database migrations
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## Database Schema

The application uses the following main tables:

- **organizations** - CPE project organizations
- **users** - User profiles (linked to auth.users)
- **courses** - Course definitions (bilingual)
- **modules** - Course modules with video and content
- **quizzes** - Quiz questions for each module
- **enrollments** - User course enrollments
- **module_progress** - Progress tracking per module
- **artifacts** - Uploaded course artifacts
- **audit_logs** - Audit trail of actions

All tables implement Row Level Security (RLS) for data isolation.

## Usage

### For Learners

1. **Sign Up / Sign In**
   - Navigate to `/en` or `/fr`
   - Create an account or sign in
   - Choose your preferred language

2. **Enroll in Courses**
   - Browse available courses from the dashboard
   - Click "Enroll" on any course
   - Receive confirmation email

3. **Complete Modules**
   - Watch videos
   - Read course content
   - Complete quizzes
   - Track your progress

4. **Upload Artifacts**
   - Upload supporting documents
   - Evidence files for course completion

5. **Earn Certificates**
   - Complete all modules (100% progress)
   - Automatic certificate generation
   - Download PDF with QR code
   - Receive certificate via email

### For Administrators

1. **Create Courses**
   - Define course details in both languages
   - Add modules with videos and content
   - Create quizzes for each module

2. **Manage Users**
   - View all users and their progress
   - Assign users to organizations
   - Monitor completion rates

3. **View Reports**
   - Access Power BI dashboards
   - Track enrollment trends
   - Monitor course completion rates

## API Endpoints

### POST `/api/enroll`
Enroll a user in a course
```json
{
  "courseId": "uuid"
}
```

### POST `/api/complete-module`
Mark a module as complete
```json
{
  "enrollmentId": "uuid",
  "moduleId": "uuid",
  "quizScore": 85
}
```

### POST `/api/generate-certificate`
Generate a certificate for completed course
```json
{
  "enrollmentId": "uuid"
}
```

### POST `/api/upload-artifact`
Upload a course artifact (multipart/form-data)
```
file: File
enrollmentId: string
```

## Internationalization

The app supports English and French. Translation files are located in `/messages/`:
- `en.json` - English translations
- `fr.json` - French translations

To add a new language:
1. Create a new JSON file in `/messages/` (e.g., `es.json`)
2. Add the locale to the `locales` array in `i18n.ts`
3. Update the `generateStaticParams` function in `app/[locale]/layout.tsx`

## Email Templates

The system sends automated emails for:
- **Enrollment confirmation** - When a user enrolls in a course
- **Certificate availability** - When a certificate is generated
- **Course reminders** - For incomplete courses (can be scheduled)

Email templates are in `/lib/email/mailer.ts`

## Power BI Integration

To enable Power BI sync:
1. Set up a Power BI workspace and dataset
2. Configure environment variables
3. The system will automatically push enrollment and progress data

## Security

- **Authentication**: Handled by Supabase Auth
- **Authorization**: Row Level Security (RLS) policies
- **Data Isolation**: Each user can only access their own data
- **Audit Trail**: All critical actions are logged
- **File Upload**: Validated and stored securely in Supabase Storage

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for CPE Academy< ! - -   E n v i r o n m e n t   v a r i a b l e s   c o n f i g u r e d   f o r   V e r c e l   d e p l o y m e n t   2 0 2 5 - 1 0 - 2 1   1 1 : 5 5 : 1 8   - - >  
 
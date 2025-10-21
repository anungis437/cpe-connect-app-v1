# Quick Setup Guide

## 1. Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account (free tier works)
- SMTP server or email service (SendGrid, Mailgun, etc.)

## 2. Installation (5 minutes)

```bash
# Clone the repository
git clone https://github.com/anungis437/cpe-connect-app-v1.git
cd cpe-connect-app-v1

# Install dependencies
npm install
```

## 3. Supabase Setup (10 minutes)

### Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details and create

### Run Database Migration
1. Go to Supabase Dashboard > SQL Editor
2. Open `supabase/migrations/20250101000000_initial_schema.sql`
3. Copy all the SQL code
4. Paste in SQL Editor and click "Run"

### Create Storage Buckets
1. Go to Storage in Supabase Dashboard
2. Create public bucket: `certificates`
3. Create public bucket: `artifacts`

### Get API Keys
1. Go to Settings > API
2. Copy:
   - Project URL (for `NEXT_PUBLIC_SUPABASE_URL`)
   - anon public key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - service_role secret (for `SUPABASE_SERVICE_ROLE_KEY`)

## 4. Environment Configuration (5 minutes)

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your values:
# - Supabase credentials from step 3
# - SMTP credentials for email
# - Power BI credentials (optional)
# - Set NEXT_PUBLIC_APP_URL to http://localhost:3000
```

## 5. Run Development Server (1 minute)

```bash
npm run dev
```

Visit http://localhost:3000

## 6. Create First User

1. Click "Sign Up" or go to `/en/auth/signup`
2. Enter your details
3. Create an account
4. You're now logged in!

## 7. Create First Course (Admin Only)

Since the first user is created as a "learner", you need to manually set them as admin:

1. Go to Supabase Dashboard > Table Editor > users
2. Find your user
3. Change `role` from `learner` to `admin`
4. Refresh your app

Now you can create courses via the dashboard or database.

## 8. Test the Full Flow

### As Admin:
1. Create a course in the database (use SQL Editor)
2. Add modules to the course
3. Add quizzes to modules
4. Publish the course (set `is_published` to true)

### As Learner:
1. Browse available courses
2. Enroll in a course
3. Complete modules
4. Take quizzes
5. Upload artifacts
6. Complete the course (100% progress)
7. Generate certificate

## Common Issues

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Connection Issues
- Check your Supabase URL and keys
- Ensure RLS policies are enabled
- Verify the migration ran successfully

### Email Not Sending
- Check SMTP credentials
- Verify SMTP_HOST and SMTP_PORT
- Test with a simple SMTP tester first

### Certificate Not Generating
- Ensure course is 100% complete
- Check Supabase storage bucket exists
- Verify storage bucket is public

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
3. See [API.md](API.md) for API documentation
4. Review [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Support

- Open an issue on GitHub
- Check existing issues for solutions
- Review Supabase documentation

## Production Checklist

Before deploying to production:

- [ ] All environment variables are set
- [ ] Database migration is run
- [ ] Storage buckets are created
- [ ] Email is configured and tested
- [ ] Auth redirects are configured in Supabase
- [ ] HTTPS is enabled
- [ ] RLS policies are tested
- [ ] Backup strategy is in place
- [ ] Monitoring is set up

## Development Tips

- Use `npm run dev` for development
- Use `npm run build` to test production build
- Use `npm run lint` to check code quality
- Check browser console for errors
- Use Supabase Dashboard to debug database issues

Enjoy building with CPE Academy LMS! 🎓

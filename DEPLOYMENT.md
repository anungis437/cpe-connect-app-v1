# Deployment Guide

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Supabase project set up

### Steps

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   
   In Vercel project settings, add all environment variables from `.env.example`:
   
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`
   - `POWERBI_WORKSPACE_ID` (optional)
   - `POWERBI_DATASET_ID` (optional)
   - `POWERBI_CLIENT_ID` (optional)
   - `POWERBI_CLIENT_SECRET` (optional)
   - `POWERBI_TENANT_ID` (optional)
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel domain)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at your Vercel domain

### Post-Deployment Steps

1. **Update Supabase Auth Settings**
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Add your Vercel domain to "Site URL"
   - Add `https://your-domain.vercel.app/**` to "Redirect URLs"

2. **Test the deployment**
   - Visit your app
   - Try signing up and signing in
   - Test creating/enrolling in courses

## Deployment to Other Platforms

### Railway

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add environment variables
4. Railway will auto-deploy

### Netlify

1. Import project from GitHub
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables
5. Deploy

### Self-Hosted with Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS base
   
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   CMD ["node", "server.js"]
   ```

2. **Build and run**:
   ```bash
   docker build -t cpe-academy-lms .
   docker run -p 3000:3000 --env-file .env cpe-academy-lms
   ```

## Database Migrations

After deployment, run the database migration:

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy content from `supabase/migrations/20250101000000_initial_schema.sql`
4. Execute the SQL

## Storage Buckets

Create the following storage buckets in Supabase:

1. **certificates** (Public)
   - For storing generated certificates
   
2. **artifacts** (Public)
   - For storing course artifacts uploaded by learners

## Monitoring

### Set up monitoring for:
- Application errors (use Sentry or similar)
- Database performance (Supabase Dashboard)
- Email delivery (SMTP provider dashboard)
- API usage (Vercel Analytics)

## Backup

### Database Backups
- Supabase automatically backs up your database
- You can also set up manual backups via Supabase CLI

### File Storage Backups
- Regular backups of Supabase storage buckets
- Consider mirroring to S3 or similar

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] Supabase RLS policies are enabled
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Rate limiting is in place (via Vercel or custom)
- [ ] Database backups are scheduled
- [ ] Monitoring and alerts are set up

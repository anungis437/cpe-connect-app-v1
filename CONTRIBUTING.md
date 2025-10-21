# Contributing to CPE Academy LMS

We appreciate your interest in contributing to the CPE Academy LMS! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/anungis437/cpe-connect-app-v1.git
   cd cpe-connect-app-v1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials
   - Set up your local database

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Code Style

- We use TypeScript for type safety
- Follow the existing code formatting
- Run `npm run lint` before committing
- Use meaningful variable and function names
- Add comments for complex logic

## Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the project structure
   - Update documentation if needed

3. **Test your changes**
   - Ensure the app builds: `npm run build`
   - Test functionality manually
   - Add tests if applicable

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Ensure all checks pass
- Request review from maintainers

## Adding Features

### New Course Components

When adding new course components:

1. Create component in `components/course/`
2. Add translations to `messages/en.json` and `messages/fr.json`
3. Update database schema if needed
4. Add API routes if required
5. Update documentation

### New API Endpoints

When creating new API endpoints:

1. Create route in `app/api/`
2. Follow RESTful conventions
3. Add proper error handling
4. Validate input data
5. Use Supabase RLS for authorization
6. Add audit logging for sensitive operations

### Database Schema Changes

1. Create a new migration file in `supabase/migrations/`
2. Use timestamp-based naming: `YYYYMMDDHHMMSS_description.sql`
3. Include both schema changes and data migrations
4. Test the migration thoroughly
5. Update TypeScript types in `types/database.ts`

## Translation Guidelines

When adding new text:

1. Add English translation to `messages/en.json`
2. Add French translation to `messages/fr.json`
3. Use the translation key in your component:
   ```tsx
   const t = useTranslations()
   <p>{t('your.translation.key')}</p>
   ```

## Testing

While we don't have automated tests yet, please:

1. Test all user flows manually
2. Test in both English and French
3. Test with different user roles (admin, instructor, learner)
4. Test on different browsers
5. Test responsive design on mobile devices

## Reporting Bugs

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser and OS information
- Error messages from console

## Feature Requests

When requesting features:

- Explain the use case
- Describe the expected behavior
- Consider how it fits with existing features
- Be open to discussion and alternatives

## Questions?

- Open an issue for questions
- Tag maintainers for urgent issues
- Be respectful and professional

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the project

Thank you for contributing to CPE Academy LMS!

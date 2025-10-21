import React from 'react';
import Screen from '@/components/ui/screen';
import { useTranslations } from 'next-intl';

/**
 * Example usage of Screen component in CPE Connect dashboard
 */
export function DashboardScreenExample() {
  const t = useTranslations('dashboard');
  
  return (
    <Screen variant="dashboard" padding="lg">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          {t('title')}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Course cards would go here */}
        </div>
      </div>
    </Screen>
  );
}

/**
 * Example usage for course module content
 */
export function CourseModuleScreenExample() {
  const t = useTranslations('course');
  
  return (
    <Screen variant="course" padding="lg" className="mx-4 my-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">{t('moduleTitle')}</h2>
          <div className="text-sm text-gray-500">Progress: 75%</div>
        </div>
        
        <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          {/* Video player would go here */}
          <span className="text-gray-500">{t('videoPlaceholder')}</span>
        </div>
        
        <div className="flex justify-between">
          <button className="btn btn-secondary">{t('previous')}</button>
          <button className="btn btn-primary">{t('next')}</button>
        </div>
      </div>
    </Screen>
  );
}

/**
 * Example usage for authentication pages
 */
export function AuthScreenExample() {
  const t = useTranslations('auth');
  
  return (
    <Screen variant="auth" fullHeight padding="none">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Screen variant="default" className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg" padding="lg">
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold">{t('signIn')}</h1>
            {/* Sign in form would go here */}
          </div>
        </Screen>
      </div>
    </Screen>
  );
}
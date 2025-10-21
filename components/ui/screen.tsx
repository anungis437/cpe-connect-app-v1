import React from 'react';
import { cn } from '@/lib/utils';

interface ScreenProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dashboard' | 'course' | 'auth';
  fullHeight?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const screenVariants = {
  default: 'bg-background text-foreground',
  dashboard: 'bg-gray-50 dark:bg-gray-900 min-h-screen',
  course: 'bg-white dark:bg-gray-800 rounded-lg border shadow-sm',
  auth: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen',
};

const paddingVariants = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Enhanced Screen component for CPE Connect platform
 * Provides consistent layout containers with theme integration
 */
const Screen: React.FC<ScreenProps> = ({
  children,
  className,
  variant = 'default',
  fullHeight = false,
  padding = 'md',
}) => {
  return (
    <div
      className={cn(
        screenVariants[variant],
        paddingVariants[padding],
        fullHeight && 'min-h-screen',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Screen;
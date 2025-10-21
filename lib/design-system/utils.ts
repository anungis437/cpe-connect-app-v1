import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as tokens from '@/lib/design-system/tokens'

/**
 * Utility function to merge Tailwind CSS classes
 * 
 * Combines clsx for conditional class names and tailwind-merge
 * for handling Tailwind class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Create responsive classes based on design system breakpoints
 */
export function createResponsiveClasses(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string,
  xxl?: string
) {
  const classes = [base]
  
  if (sm) classes.push(`sm:${sm}`)
  if (md) classes.push(`md:${md}`)
  if (lg) classes.push(`lg:${lg}`)
  if (xl) classes.push(`xl:${xl}`)
  if (xxl) classes.push(`2xl:${xxl}`)
  
  return classes.join(' ')
}

/**
 * Generate focus ring classes with design system values
 */
export function focusRing(color: 'primary' | 'secondary' | 'accent' = 'primary') {
  const colorMap = {
    primary: 'ring-blue-500/20 border-blue-500',
    secondary: 'ring-teal-500/20 border-teal-500',
    accent: 'ring-violet-500/20 border-violet-500',
  }
  
  return cn(
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    colorMap[color]
  )
}

/**
 * Generate animation classes with design system timing
 */
export function createAnimationClasses(
  animation: keyof typeof tokens.animation.duration,
  easing: keyof typeof tokens.animation.timing = 'inOut'
) {
  const duration = tokens.animation.duration[animation]
  const easingValue = tokens.animation.timing[easing]
  
  return {
    transitionDuration: duration,
    transitionTimingFunction: easingValue,
  }
}

/**
 * Generate elevation/shadow classes
 */
export function getElevation(level: keyof typeof tokens.boxShadow) {
  const shadow = tokens.boxShadow[level]
  return `shadow-[${shadow}]`
}

/**
 * Convert design tokens to CSS custom properties
 */
export function tokensToCSSVars(prefix = '--cpe') {
  const cssVars: Record<string, string> = {}
  
  // Colors
  Object.entries(tokens.colors).forEach(([colorGroup, colors]) => {
    Object.entries(colors).forEach(([shade, value]) => {
      cssVars[`${prefix}-color-${colorGroup}-${shade}`] = value
    })
  })
  
  // Typography - Font weights
  Object.entries(tokens.typography.fontWeight).forEach(([weight, value]) => {
    cssVars[`${prefix}-font-weight-${weight}`] = String(value)
  })
  
  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    cssVars[`${prefix}-spacing-${key}`] = value
  })
  
  // Border radius
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    cssVars[`${prefix}-radius-${key}`] = value
  })
  
  return cssVars
}

/**
 * Screen size utilities based on design system breakpoints
 */
export const screens = {
  xs: parseInt(tokens.breakpoints.xs),
  sm: parseInt(tokens.breakpoints.sm),
  md: parseInt(tokens.breakpoints.md),
  lg: parseInt(tokens.breakpoints.lg),
  xl: parseInt(tokens.breakpoints.xl),
  '2xl': parseInt(tokens.breakpoints['2xl']),
} as const

/**
 * Check if current screen size matches breakpoint
 */
export function useBreakpoint(breakpoint: keyof typeof screens) {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia(`(min-width: ${screens[breakpoint]}px)`).matches
}

/**
 * Format component display name for debugging
 */
export function formatDisplayName(componentName: string, variant?: string) {
  if (variant) {
    return `${componentName}.${variant}`
  }
  return componentName
}

/**
 * Generate component class names with consistent patterns
 */
export function createComponentClasses(
  base: string,
  variant?: string,
  size?: string,
  state?: string
) {
  const classes = [base]
  
  if (variant) classes.push(`${base}--${variant}`)
  if (size) classes.push(`${base}--${size}`)
  if (state) classes.push(`${base}--${state}`)
  
  return classes.join(' ')
}

/**
 * Safe access to nested object properties
 */
export function get<T>(
  obj: any,
  path: string,
  defaultValue?: T
): T {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue as T
    }
    result = result[key]
  }
  
  return result ?? defaultValue
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
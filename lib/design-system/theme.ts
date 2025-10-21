/**
 * CPE Connect Theme System
 * 
 * Comprehensive theme configuration supporting light/dark modes
 * and accessible color combinations
 */

import { colors } from './tokens'

// Theme Configuration Types
export interface ThemeColors {
  // Background colors
  background: {
    primary: string
    secondary: string
    tertiary: string
    accent: string
    inverse: string
  }
  
  // Foreground colors
  foreground: {
    primary: string
    secondary: string
    tertiary: string
    accent: string
    inverse: string
    muted: string
  }
  
  // Border colors
  border: {
    primary: string
    secondary: string
    accent: string
    focus: string
  }
  
  // Brand colors
  brand: {
    primary: string
    secondary: string
    hover: string
    active: string
    subtle: string
  }
  
  // State colors
  state: {
    success: string
    warning: string
    error: string
    info: string
    successBg: string
    warningBg: string
    errorBg: string
    infoBg: string
  }
  
  // Interactive colors
  interactive: {
    primary: string
    secondary: string
    hover: string
    active: string
    disabled: string
    focus: string
  }
}

export interface Theme {
  name: string
  colors: ThemeColors
}

// Light Theme
export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: {
      primary: colors.neutral[0],      // Pure white
      secondary: colors.neutral[50],    // Very light gray
      tertiary: colors.neutral[100],    // Light gray
      accent: colors.primary[50],       // Very light blue
      inverse: colors.neutral[900],     // Very dark gray
    },
    
    foreground: {
      primary: colors.neutral[900],     // Very dark gray
      secondary: colors.neutral[700],   // Dark gray
      tertiary: colors.neutral[500],    // Medium gray
      accent: colors.primary[600],      // Medium blue
      inverse: colors.neutral[0],       // White
      muted: colors.neutral[400],       // Light gray
    },
    
    border: {
      primary: colors.neutral[200],     // Light gray
      secondary: colors.neutral[300],   // Medium light gray
      accent: colors.primary[300],      // Light blue
      focus: colors.primary[500],       // Main blue
    },
    
    brand: {
      primary: colors.primary[500],     // Main brand blue
      secondary: colors.secondary[500], // Main teal
      hover: colors.primary[600],       // Darker blue
      active: colors.primary[700],      // Even darker blue
      subtle: colors.primary[50],       // Very light blue
    },
    
    state: {
      success: colors.success[600],     // Success green
      warning: colors.warning[500],     // Warning amber
      error: colors.error[600],         // Error red
      info: colors.primary[500],        // Info blue
      successBg: colors.success[50],    // Light success bg
      warningBg: colors.warning[50],    // Light warning bg
      errorBg: colors.error[50],        // Light error bg
      infoBg: colors.primary[50],       // Light info bg
    },
    
    interactive: {
      primary: colors.primary[500],     // Main interactive
      secondary: colors.neutral[100],   // Secondary interactive
      hover: colors.primary[600],       // Hover state
      active: colors.primary[700],      // Active state
      disabled: colors.neutral[300],    // Disabled state
      focus: colors.primary[500],       // Focus ring
    },
  },
}

// Dark Theme
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: {
      primary: colors.neutral[950],     // Very dark
      secondary: colors.neutral[900],   // Dark gray
      tertiary: colors.neutral[800],    // Medium dark gray
      accent: colors.primary[950],      // Very dark blue
      inverse: colors.neutral[50],      // Very light gray
    },
    
    foreground: {
      primary: colors.neutral[50],      // Very light gray
      secondary: colors.neutral[200],   // Light gray
      tertiary: colors.neutral[400],    // Medium gray
      accent: colors.primary[400],      // Light blue
      inverse: colors.neutral[900],     // Very dark gray
      muted: colors.neutral[500],       // Medium gray
    },
    
    border: {
      primary: colors.neutral[800],     // Dark gray
      secondary: colors.neutral[700],   // Medium dark gray
      accent: colors.primary[700],      // Dark blue
      focus: colors.primary[400],       // Light blue
    },
    
    brand: {
      primary: colors.primary[400],     // Light brand blue
      secondary: colors.secondary[400], // Light teal
      hover: colors.primary[300],       // Lighter blue
      active: colors.primary[200],      // Even lighter blue
      subtle: colors.primary[950],      // Very dark blue
    },
    
    state: {
      success: colors.success[400],     // Light success green
      warning: colors.warning[400],     // Light warning amber
      error: colors.error[400],         // Light error red
      info: colors.primary[400],        // Light info blue
      successBg: colors.success[950],   // Dark success bg
      warningBg: colors.warning[950],   // Dark warning bg
      errorBg: colors.error[950],       // Dark error bg
      infoBg: colors.primary[950],      // Dark info bg
    },
    
    interactive: {
      primary: colors.primary[400],     // Light interactive
      secondary: colors.neutral[800],   // Dark secondary interactive
      hover: colors.primary[300],       // Hover state
      active: colors.primary[200],      // Active state
      disabled: colors.neutral[700],    // Disabled state
      focus: colors.primary[400],       // Focus ring
    },
  },
}

// Theme utilities
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const

export type ThemeName = keyof typeof themes

// CSS Custom Properties Generator
export function generateCSSVariables(theme: Theme): Record<string, string> {
  const cssVars: Record<string, string> = {}
  
  // Helper function to flatten theme colors
  function flattenColors(obj: any, prefix = ''): void {
    Object.entries(obj).forEach(([key, value]) => {
      const cssKey = prefix ? `${prefix}-${key}` : key
      
      if (typeof value === 'string') {
        cssVars[`--cpe-${cssKey}`] = value
      } else if (typeof value === 'object' && value !== null) {
        flattenColors(value, cssKey)
      }
    })
  }
  
  flattenColors(theme.colors)
  
  return cssVars
}

// Tailwind CSS Color Configuration
export function generateTailwindColors(theme: Theme) {
  return {
    background: {
      DEFAULT: theme.colors.background.primary,
      secondary: theme.colors.background.secondary,
      tertiary: theme.colors.background.tertiary,
      accent: theme.colors.background.accent,
      inverse: theme.colors.background.inverse,
    },
    foreground: {
      DEFAULT: theme.colors.foreground.primary,
      secondary: theme.colors.foreground.secondary,
      tertiary: theme.colors.foreground.tertiary,
      accent: theme.colors.foreground.accent,
      inverse: theme.colors.foreground.inverse,
      muted: theme.colors.foreground.muted,
    },
    border: {
      DEFAULT: theme.colors.border.primary,
      secondary: theme.colors.border.secondary,
      accent: theme.colors.border.accent,
      focus: theme.colors.border.focus,
    },
    brand: {
      DEFAULT: theme.colors.brand.primary,
      secondary: theme.colors.brand.secondary,
      hover: theme.colors.brand.hover,
      active: theme.colors.brand.active,
      subtle: theme.colors.brand.subtle,
    },
    success: theme.colors.state.success,
    warning: theme.colors.state.warning,
    error: theme.colors.state.error,
    info: theme.colors.state.info,
  }
}

// Semantic Color Mappings for Components
export const semanticColors = {
  text: {
    primary: 'var(--cpe-foreground-primary)',
    secondary: 'var(--cpe-foreground-secondary)',
    tertiary: 'var(--cpe-foreground-tertiary)',
    accent: 'var(--cpe-foreground-accent)',
    inverse: 'var(--cpe-foreground-inverse)',
    muted: 'var(--cpe-foreground-muted)',
  },
  
  surface: {
    primary: 'var(--cpe-background-primary)',
    secondary: 'var(--cpe-background-secondary)',
    tertiary: 'var(--cpe-background-tertiary)',
    accent: 'var(--cpe-background-accent)',
    inverse: 'var(--cpe-background-inverse)',
  },
  
  stroke: {
    primary: 'var(--cpe-border-primary)',
    secondary: 'var(--cpe-border-secondary)',
    accent: 'var(--cpe-border-accent)',
    focus: 'var(--cpe-border-focus)',
  },
  
  brand: {
    primary: 'var(--cpe-brand-primary)',
    secondary: 'var(--cpe-brand-secondary)',
    hover: 'var(--cpe-brand-hover)',
    active: 'var(--cpe-brand-active)',
    subtle: 'var(--cpe-brand-subtle)',
  },
  
  feedback: {
    success: 'var(--cpe-state-success)',
    warning: 'var(--cpe-state-warning)',
    error: 'var(--cpe-state-error)',
    info: 'var(--cpe-state-info)',
    successBg: 'var(--cpe-state-successBg)',
    warningBg: 'var(--cpe-state-warningBg)',
    errorBg: 'var(--cpe-state-errorBg)',
    infoBg: 'var(--cpe-state-infoBg)',
  },
} as const

// Default theme
export const defaultTheme = lightTheme

// Export theme context types
export interface ThemeContextType {
  theme: Theme
  themeName: ThemeName
  setTheme: (themeName: ThemeName) => void
  toggleTheme: () => void
  isDark: boolean
  mounted: boolean
}
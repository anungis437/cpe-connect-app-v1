'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  Theme, 
  ThemeName, 
  ThemeContextType, 
  themes, 
  defaultTheme, 
  generateCSSVariables 
} from '@/lib/design-system/theme'

// Theme Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Local storage key
const THEME_STORAGE_KEY = 'cpe-connect-theme'

// Theme Provider Props
interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeName
  storageKey?: string
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

/**
 * Theme Provider Component
 * 
 * Provides theme context to the entire application with:
 * - Automatic dark/light mode detection
 * - Local storage persistence
 * - CSS custom properties injection
 * - Smooth theme transitions
 */
export function ThemeProvider({
  children,
  defaultTheme: defaultThemeName = 'light',
  storageKey = THEME_STORAGE_KEY,
  attribute = 'data-theme',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // Use a function to get initial theme to prevent hydration mismatch
  const [themeName, setThemeNameState] = useState<ThemeName>(() => defaultThemeName)
  const [mounted, setMounted] = useState(false)

  // Get current theme object
  const theme = themes[themeName]

  // Initialize theme on mount - simplified approach
  useEffect(() => {
    setMounted(true)
  }, [])

  // Apply theme to DOM
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    
    // Disable transitions during theme change if requested
    if (disableTransitionOnChange) {
      const css = document.createElement('style')
      css.appendChild(
        document.createTextNode(
          '* { transition: none !important; animation-duration: 0s !important; }'
        )
      )
      document.head.appendChild(css)
      
      // Force reflow
      window.getComputedStyle(css).opacity
      document.head.removeChild(css)
    }

    // Set theme attribute
    root.setAttribute(attribute, themeName)
    
    // Generate and apply CSS custom properties
    const cssVars = generateCSSVariables(theme)
    Object.entries(cssVars).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.colors.background.primary)
    }

  }, [theme, themeName, attribute, disableTransitionOnChange, mounted])

  // Theme management functions
  const setTheme = (newThemeName: ThemeName) => {
    try {
      localStorage.setItem(storageKey, newThemeName)
      setThemeNameState(newThemeName)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
      setThemeNameState(newThemeName)
    }
  }

  const toggleTheme = () => {
    const newTheme: ThemeName = themeName === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    themeName,
    setTheme,
    toggleTheme,
    isDark: themeName === 'dark',
    mounted,
  }

  // Always render the provider to prevent hydration mismatches
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to use theme context
 * 
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}

/**
 * Hook to get theme-aware colors
 * 
 * Returns semantic colors that automatically adapt to current theme
 */
export function useThemeColors() {
  const { theme } = useTheme()
  
  return {
    // Background colors
    bg: {
      primary: theme.colors.background.primary,
      secondary: theme.colors.background.secondary,
      tertiary: theme.colors.background.tertiary,
      accent: theme.colors.background.accent,
      inverse: theme.colors.background.inverse,
    },
    
    // Text colors
    text: {
      primary: theme.colors.foreground.primary,
      secondary: theme.colors.foreground.secondary,
      tertiary: theme.colors.foreground.tertiary,
      accent: theme.colors.foreground.accent,
      inverse: theme.colors.foreground.inverse,
      muted: theme.colors.foreground.muted,
    },
    
    // Border colors
    border: {
      primary: theme.colors.border.primary,
      secondary: theme.colors.border.secondary,
      accent: theme.colors.border.accent,
      focus: theme.colors.border.focus,
    },
    
    // Brand colors
    brand: {
      primary: theme.colors.brand.primary,
      secondary: theme.colors.brand.secondary,
      hover: theme.colors.brand.hover,
      active: theme.colors.brand.active,
      subtle: theme.colors.brand.subtle,
    },
    
    // State colors
    state: {
      success: theme.colors.state.success,
      warning: theme.colors.state.warning,
      error: theme.colors.state.error,
      info: theme.colors.state.info,
      successBg: theme.colors.state.successBg,
      warningBg: theme.colors.state.warningBg,
      errorBg: theme.colors.state.errorBg,
      infoBg: theme.colors.state.infoBg,
    },
    
    // Interactive colors
    interactive: {
      primary: theme.colors.interactive.primary,
      secondary: theme.colors.interactive.secondary,
      hover: theme.colors.interactive.hover,
      active: theme.colors.interactive.active,
      disabled: theme.colors.interactive.disabled,
      focus: theme.colors.interactive.focus,
    },
  }
}

/**
 * Utility component for theme-aware styling
 * SSR-safe: Only runs on client side to prevent hydration mismatches
 */
export function ThemeScript({ storageKey = THEME_STORAGE_KEY }: { storageKey?: string } = {}) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Set initial theme before React hydration to prevent flash
              var theme = 'light'; // default fallback
              
              if (typeof window !== 'undefined') {
                var stored = localStorage.getItem('${storageKey}');
                if (stored === 'dark' || stored === 'light') {
                  theme = stored;
                } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  theme = 'dark';
                }
              }
              
              document.documentElement.setAttribute('data-theme', theme);
              document.documentElement.style.setProperty('color-scheme', theme);
            } catch (e) {
              // Fallback: always set light theme if anything fails
              document.documentElement.setAttribute('data-theme', 'light');
              document.documentElement.style.setProperty('color-scheme', 'light');
            }
          })();
        `,
      }}
    />
  )
}
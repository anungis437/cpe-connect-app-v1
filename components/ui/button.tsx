import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/design-system/utils"

/**
 * Button Component Variants
 * 
 * Enhanced with CPE Connect design system tokens
 * and comprehensive accessibility features
 */
const buttonVariants = cva(
  [
    // Base styles using design system
    'inline-flex items-center justify-center gap-2',
    'whitespace-nowrap rounded-md text-sm font-medium',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98] active:transition-transform active:duration-75',
  ],
  {
    variants: {
      variant: {
        // Primary - CPE brand blue
        default: [
          'bg-blue-600 text-white shadow-sm',
          'hover:bg-blue-700 hover:shadow-md',
          'focus-visible:ring-blue-500',
          'active:bg-blue-800',
        ],
        
        // Secondary - Light with border
        secondary: [
          'bg-white border border-gray-300 text-gray-900 shadow-sm',
          'hover:bg-gray-50 hover:border-gray-400 hover:shadow-md',
          'focus-visible:ring-blue-500',
          'active:bg-gray-100',
          'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
          'dark:hover:bg-gray-700 dark:hover:border-gray-500',
        ],
        
        // Destructive - Red for dangerous actions
        destructive: [
          'bg-red-600 text-white shadow-sm',
          'hover:bg-red-700 hover:shadow-md',
          'focus-visible:ring-red-500',
          'active:bg-red-800',
        ],
        
        // Outline - Subtle with border
        outline: [
          'border border-gray-300 bg-transparent text-gray-900',
          'hover:bg-gray-50 hover:border-gray-400',
          'focus-visible:ring-blue-500',
          'active:bg-gray-100',
          'dark:border-gray-600 dark:text-gray-100',
          'dark:hover:bg-gray-800 dark:hover:border-gray-500',
        ],
        
        // Ghost - Minimal
        ghost: [
          'bg-transparent text-gray-700 shadow-none',
          'hover:bg-gray-100 hover:text-gray-900',
          'focus-visible:ring-blue-500',
          'active:bg-gray-200',
          'dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100',
        ],
        
        // Link - Text only
        link: [
          'bg-transparent text-blue-600 underline-offset-4 shadow-none p-0',
          'hover:underline hover:text-blue-700',
          'focus-visible:ring-blue-500',
          'active:text-blue-800',
          'dark:text-blue-400 dark:hover:text-blue-300',
        ],
        
        // Success - Green for positive actions
        success: [
          'bg-green-600 text-white shadow-sm',
          'hover:bg-green-700 hover:shadow-md',
          'focus-visible:ring-green-500',
          'active:bg-green-800',
        ],
        
        // Warning - Yellow for caution
        warning: [
          'bg-yellow-600 text-white shadow-sm',
          'hover:bg-yellow-700 hover:shadow-md',
          'focus-visible:ring-yellow-500',
          'active:bg-yellow-800',
        ],
      },
      
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
      },
      
      loading: {
        true: 'cursor-wait',
      },
      
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

/**
 * Button Component Props
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a different component (e.g., Link) */
  asChild?: boolean
  /** Show loading state with spinner */
  loading?: boolean
  /** Icon to display before the text */
  leftIcon?: React.ReactNode
  /** Icon to display after the text */
  rightIcon?: React.ReactNode
  /** Make button full width */
  fullWidth?: boolean
}

/**
 * Loading Spinner Component
 */
const LoadingSpinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-label="Loading"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

/**
 * Button Component
 * 
 * Enhanced button component with comprehensive variant support,
 * loading states, icons, and accessibility features
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, loading, fullWidth, className })
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {/* Loading state */}
        {loading && <LoadingSpinner />}
        
        {/* Left icon */}
        {!loading && leftIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {/* Button content */}
        <span className={loading ? 'opacity-0' : undefined}>
          {children}
        </span>
        
        {/* Right icon */}
        {!loading && rightIcon && (
          <span className="inline-flex shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
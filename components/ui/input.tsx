import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/design-system/utils"

/**
 * Input Component Variants
 */
const inputVariants = cva(
  [
    'flex w-full rounded-md border bg-white px-3 py-2',
    'text-sm placeholder:text-gray-500',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'dark:bg-gray-800 dark:placeholder:text-gray-400',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-gray-300 text-gray-900',
          'focus-visible:border-blue-500 focus-visible:ring-blue-500/20',
          'hover:border-gray-400',
          'dark:border-gray-600 dark:text-gray-100',
          'dark:focus-visible:border-blue-400 dark:focus-visible:ring-blue-400/20',
        ],
        success: [
          'border-green-300 text-gray-900',
          'focus-visible:border-green-500 focus-visible:ring-green-500/20',
          'dark:border-green-600 dark:text-gray-100',
        ],
        warning: [
          'border-yellow-300 text-gray-900',
          'focus-visible:border-yellow-500 focus-visible:ring-yellow-500/20',
          'dark:border-yellow-600 dark:text-gray-100',
        ],
        error: [
          'border-red-300 text-gray-900',
          'focus-visible:border-red-500 focus-visible:ring-red-500/20',
          'dark:border-red-600 dark:text-gray-100',
        ],
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10 px-3',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

/**
 * Enhanced Input Component Props
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Label for the input */
  label?: string
  /** Left icon or element */
  leftElement?: React.ReactNode
  /** Right icon or element */
  rightElement?: React.ReactNode
}

/**
 * Enhanced Input Component
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = "text",
    error,
    helperText,
    label,
    leftElement,
    rightElement,
    id,
    required,
    ...props 
  }, ref) => {
    const inputId = id || React.useId()
    const helperTextId = `${inputId}-helper`
    const errorId = `${inputId}-error`
    
    // Use error variant if error exists
    const effectiveVariant = error ? 'error' : variant
    
    const inputElement = (
      <input
        id={inputId}
        type={type}
        className={cn(
          inputVariants({ variant: effectiveVariant, size }),
          {
            'pl-10': leftElement,
            'pr-10': rightElement,
          },
          className
        )}
        ref={ref}
        aria-describedby={cn(
          error && errorId,
          helperText && helperTextId
        )}
        aria-invalid={error ? "true" : "false"}
        aria-required={required ? "true" : "false"}
        {...props}
      />
    )
    
    const renderInput = () => {
      if (leftElement || rightElement) {
        return (
          <div className="relative">
            {leftElement && (
              <div className="pointer-events-none absolute left-0 top-0 flex h-full w-10 items-center justify-center text-gray-500 dark:text-gray-400">
                {leftElement}
              </div>
            )}
            {inputElement}
            {rightElement && (
              <div className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-gray-500 dark:text-gray-400">
                {rightElement}
              </div>
            )}
          </div>
        )
      }
      return inputElement
    }
    
    return (
      <div className="space-y-1">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        
        {renderInput()}
        
        {error && (
          <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperTextId} className="text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
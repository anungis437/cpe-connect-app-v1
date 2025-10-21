'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils/ui';
import { cva, type VariantProps } from 'class-variance-authority';

const progressVariants = cva(
  "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        sm: "h-2",
        md: "h-4",
        lg: "h-6",
        xl: "h-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 bg-primary transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        error: "bg-red-500",
        info: "bg-blue-500",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animated: false,
    },
  }
);

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & 
  VariantProps<typeof progressVariants> & 
  VariantProps<typeof progressIndicatorVariants>
>(({ className, value, size, variant, animated, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ size }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(progressIndicatorVariants({ variant, animated }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// Enhanced Progress with label and percentage
interface ProgressWithLabelProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: VariantProps<typeof progressVariants>['size'];
  variant?: VariantProps<typeof progressIndicatorVariants>['variant'];
  className?: string;
}

export const ProgressWithLabel = ({
  value,
  max = 100,
  label,
  showValue = false,
  size = "md",
  variant = "default",
  className
}: ProgressWithLabelProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={cn("space-y-2", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-gray-700">{label}</span>}
          {showValue && (
            <span className="text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <Progress 
        value={percentage} 
        size={size} 
        variant={variant}
      />
    </div>
  );
};

// Circular Progress component
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export const CircularProgress = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  showValue = true,
  variant = 'default'
}: CircularProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    default: '#3b82f6', // blue-500
    success: '#10b981', // green-500
    warning: '#f59e0b', // yellow-500
    error: '#ef4444', // red-500
    info: '#06b6d4', // cyan-500
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// Multi-step Progress component
interface StepProgressProps {
  steps: Array<{
    label: string;
    description?: string;
    completed?: boolean;
    current?: boolean;
  }>;
  className?: string;
}

export const StepProgress = ({ steps, className }: StepProgressProps) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium",
                step.completed 
                  ? "bg-blue-600 border-blue-600 text-white"
                  : step.current
                    ? "bg-blue-100 border-blue-600 text-blue-600"
                    : "bg-gray-100 border-gray-300 text-gray-500"
              )}>
                {step.completed ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-xs font-medium",
                  step.completed || step.current ? "text-blue-600" : "text-gray-500"
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 -mt-4",
                steps[index + 1]?.completed ? "bg-blue-600" : "bg-gray-300"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Loading Progress for async operations
interface LoadingProgressProps {
  isLoading: boolean;
  progress?: number;
  text?: string;
  className?: string;
}

export const LoadingProgress = ({ 
  isLoading, 
  progress, 
  text = "Loading...", 
  className 
}: LoadingProgressProps) => {
  if (!isLoading) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{text}</span>
        {typeof progress === 'number' && (
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        )}
      </div>
      <Progress 
        value={progress} 
        variant="info"
        animated={typeof progress !== 'number'}
      />
    </div>
  );
};

export { Progress };
'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils/ui';
import { cva, type VariantProps } from 'class-variance-authority';

const tabsVariants = cva(
  "w-full",
  {
    variants: {
      orientation: {
        horizontal: "flex flex-col",
        vertical: "flex flex-row",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
);

const tabsListVariants = cva(
  "inline-flex items-center justify-start rounded-lg p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        underline: "border-b border-border bg-transparent p-0",
        pills: "bg-gray-100 p-1",
        minimal: "bg-transparent p-0 space-x-1",
      },
      orientation: {
        horizontal: "h-10 w-full",
        vertical: "h-auto w-fit flex-col space-y-1",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
    },
  }
);

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        underline: "rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary",
        pills: "rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm",
        minimal: "rounded-md hover:bg-gray-100 data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & 
  VariantProps<typeof tabsVariants>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(tabsVariants({ orientation }), className)}
    {...props}
  />
));
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & 
  VariantProps<typeof tabsListVariants>
>(({ className, variant, orientation, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, orientation }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & 
  VariantProps<typeof tabsTriggerVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Enhanced Tab component with icons and badges
interface TabWithIconProps {
  value: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const TabWithIcon = ({ 
  value, 
  icon, 
  badge, 
  children, 
  disabled, 
  className 
}: TabWithIconProps) => {
  return (
    <TabsTrigger value={value} disabled={disabled} className={cn("flex items-center gap-2", className)}>
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{children}</span>
      {badge && (
        <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
          {badge}
        </span>
      )}
    </TabsTrigger>
  );
};

// Simple tabs preset for common use cases
interface SimpleTabsProps {
  tabs: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  defaultValue?: string;
  variant?: VariantProps<typeof tabsListVariants>['variant'];
  orientation?: VariantProps<typeof tabsVariants>['orientation'];
  className?: string;
  onValueChange?: (value: string) => void;
}

export const SimpleTabs = ({ 
  tabs, 
  defaultValue, 
  variant = "default", 
  orientation = "horizontal",
  className,
  onValueChange 
}: SimpleTabsProps) => {
  return (
    <Tabs 
      defaultValue={defaultValue || tabs[0]?.value} 
      orientation={orientation || "horizontal"}
      onValueChange={onValueChange}
      className={className}
    >
      <TabsList variant={variant} orientation={orientation || "horizontal"}>
        {tabs.map((tab) => (
          <TabWithIcon
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            badge={tab.badge}
            disabled={tab.disabled}
          >
            {tab.label}
          </TabWithIcon>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// Dashboard tabs for admin interface
interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
    content: React.ReactNode;
  }>;
  className?: string;
}

export const DashboardTabs = ({ 
  activeTab, 
  onTabChange, 
  tabs, 
  className 
}: DashboardTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className={className}>
      <TabsList variant="underline" className="w-full border-b">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            variant="underline"
            className="flex items-center gap-2"
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {typeof tab.count !== 'undefined' && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                {tab.count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

// Vertical tabs for settings pages
export const VerticalTabs = ({ 
  tabs, 
  defaultValue, 
  className,
  onValueChange 
}: Omit<SimpleTabsProps, 'variant' | 'orientation'>) => {
  return (
    <SimpleTabs
      tabs={tabs}
      defaultValue={defaultValue}
      variant="minimal"
      orientation="vertical"
      className={cn("flex gap-6", className)}
      onValueChange={onValueChange}
    />
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
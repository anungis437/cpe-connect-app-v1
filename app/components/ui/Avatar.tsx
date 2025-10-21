'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils/ui';
import { cva, type VariantProps } from 'class-variance-authority';

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-20 w-20",
        "3xl": "h-24 w-24",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & 
  VariantProps<typeof avatarVariants>
>(({ className, size, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size }), className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// Enhanced Avatar with automatic fallback and status indicator
interface UserAvatarProps {
  src?: string;
  name: string;
  size?: VariantProps<typeof avatarVariants>['size'];
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  className?: string;
  fallbackClassName?: string;
}

export const UserAvatar = ({
  src,
  name,
  size = "md",
  status,
  showStatus = false,
  className,
  fallbackClassName
}: UserAvatarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const statusColors = {
    online: 'bg-green-400 border-green-400',
    offline: 'bg-gray-400 border-gray-400',
    away: 'bg-yellow-400 border-yellow-400',
    busy: 'bg-red-400 border-red-400',
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
    '3xl': 'w-6 h-6',
  };

  return (
    <div className="relative">
      <Avatar size={size} className={className}>
        <AvatarImage src={src} alt={name} />
        <AvatarFallback className={cn(
          "bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold",
          fallbackClassName
        )}>
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {showStatus && status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full border-2 border-white",
            statusColors[status],
            statusSizes[size || 'md']
          )}
        />
      )}
    </div>
  );
};

// Avatar Group for displaying multiple users
interface AvatarGroupProps {
  users: Array<{
    src?: string;
    name: string;
    id: string;
  }>;
  max?: number;
  size?: VariantProps<typeof avatarVariants>['size'];
  className?: string;
  onAvatarClick?: (userId: string) => void;
}

export const AvatarGroup = ({
  users,
  max = 4,
  size = "md",
  className,
  onAvatarClick
}: AvatarGroupProps) => {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const spacingClasses = {
    xs: '-space-x-1',
    sm: '-space-x-1.5',
    md: '-space-x-2',
    lg: '-space-x-2.5',
    xl: '-space-x-3',
    '2xl': '-space-x-4',
    '3xl': '-space-x-5',
  };

  return (
    <div className={cn("flex items-center", spacingClasses[size || 'md'], className)}>
      {displayUsers.map((user, index) => (
        <div 
          key={user.id}
          className={cn(
            "relative",
            onAvatarClick && "cursor-pointer hover:z-10 transition-transform hover:scale-110"
          )}
          onClick={() => onAvatarClick?.(user.id)}
          style={{ zIndex: displayUsers.length - index }}
        >
          <UserAvatar
            src={user.src}
            name={user.name}
            size={size}
            className="ring-2 ring-white"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <Avatar size={size} className="ring-2 ring-white">
          <AvatarFallback className="bg-gray-100 text-gray-600 font-medium">
            +{remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

// Editable Avatar with upload functionality
interface EditableAvatarProps {
  src?: string;
  name: string;
  size?: VariantProps<typeof avatarVariants>['size'];
  onImageChange?: (file: File) => void;
  onRemove?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const EditableAvatar = ({
  src,
  name,
  size = "xl",
  onImageChange,
  onRemove,
  isLoading = false,
  className
}: EditableAvatarProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative group", className)}>
      <UserAvatar src={src} name={name} size={size} />
      
      {/* Overlay with edit buttons */}
      <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="flex space-x-2">
          <button
            onClick={handleUploadClick}
            disabled={isLoading}
            className="p-1 bg-white rounded-full text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Change avatar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {src && onRemove && (
            <button
              onClick={onRemove}
              disabled={isLoading}
              className="p-1 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Remove avatar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload avatar image"
        title="Upload avatar image"
      />
    </div>
  );
};

export { Avatar, AvatarImage, AvatarFallback };
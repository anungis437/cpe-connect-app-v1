'use client';

import toast, { Toaster, ToastOptions as HotToastOptions } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/ui';

// Custom toast options
interface ToastOptions extends Omit<HotToastOptions, 'icon'> {
  title?: string;
  description?: string;
}

// Toast notification functions
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      className: cn(
        "bg-white border border-green-200 text-green-900 shadow-lg",
        options?.className
      ),
      ...options,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      className: cn(
        "bg-white border border-red-200 text-red-900 shadow-lg",
        options?.className
      ),
      ...options,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast(message, {
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      className: cn(
        "bg-white border border-yellow-200 text-yellow-900 shadow-lg",
        options?.className
      ),
      ...options,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    toast(message, {
      icon: <Info className="w-5 h-5 text-blue-500" />,
      className: cn(
        "bg-white border border-blue-200 text-blue-900 shadow-lg",
        options?.className
      ),
      ...options,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },

  custom: (component: React.ReactElement, options?: ToastOptions) => {
    toast.custom(() => component, options);
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  remove: (toastId: string) => {
    toast.remove(toastId);
  },
};

// Toast provider component
export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        className: '',
        duration: 4000,
        style: {
          background: 'white',
          color: '#333',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontFamily: 'Poppins, system-ui, sans-serif',
          fontSize: '14px',
          maxWidth: '400px',
          padding: '12px 16px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
        },
      }}
    />
  );
};

// Rich toast component for complex notifications
interface RichToastProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

export const RichToast = ({ 
  title, 
  description, 
  action, 
  type = 'info',
  onClose 
}: RichToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  return (
    <div className="flex items-start space-x-3 p-4 bg-white border rounded-lg shadow-lg max-w-sm">
      {icons[type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        {action && (
          <div className="mt-3">
            <button
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
              onClick={action.onClick}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      {onClose && (
        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Close notification"
          title="Close"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Convenience functions for common use cases
export const notifySuccess = (message: string) => showToast.success(message);
export const notifyError = (message: string) => showToast.error(message);
export const notifyWarning = (message: string) => showToast.warning(message);
export const notifyInfo = (message: string) => showToast.info(message);

// API response handlers
export const handleApiResponse = <T,>(
  promise: Promise<Response>,
  messages?: {
    loading?: string;
    success?: string;
    error?: string;
  }
) => {
  const defaultMessages = {
    loading: 'Processing...',
    success: 'Operation completed successfully',
    error: 'An error occurred',
  };

  const finalMessages = { ...defaultMessages, ...messages };

  return showToast.promise(
    promise.then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Request failed');
      }
      return response.json();
    }),
    {
      loading: finalMessages.loading,
      success: finalMessages.success,
      error: (error) => error.message || finalMessages.error,
    }
  );
};

export default showToast;
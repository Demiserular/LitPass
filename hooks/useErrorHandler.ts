import { useCallback } from 'react';

// Simple toast function that just logs to console
// This avoids the ToastProvider dependency issue
function logToast(message: string, type: string) {
  console.log(`🔔 [${type.toUpperCase()}] ${message}`);
}

// Safe toast hook that doesn't crash if ToastProvider is not available
export function useSafeToast() {
  try {
    const { useToast } = require('@/components/Toast');
    return useToast();
  } catch (error) {
    // Return a safe fallback if ToastProvider is not available
    return {
      showToast: (message: string, type: string, duration?: number) => {
        console.log(`🔔 [${type.toUpperCase()}] ${message}`);
      }
    };
  }
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastMessage?: string;
  logError?: boolean;
  fallbackAction?: () => void;
}

export function useErrorHandler() {
  const handleError = useCallback((
    error: Error | unknown,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast: shouldShowToast = true,
      toastMessage,
      logError = true,
      fallbackAction,
    } = options;

    // Convert unknown error to Error object
    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Log the error
    if (logError) {
      console.error(`Error in ${context || 'Unknown context'}:`, errorObj);
    }

    // Show toast notification (log to console for now)
    if (shouldShowToast) {
      const message = toastMessage || getErrorMessage(errorObj, context);
      logToast(message, 'error');
      // Note: For actual toast notifications, use the useToast hook directly in your components
    }

    // Execute fallback action if provided
    if (fallbackAction) {
      try {
        fallbackAction();
      } catch (fallbackError) {
        console.error('Error in fallback action:', fallbackError);
      }
    }

    // In production, you might want to send to error reporting service
    if (!__DEV__) {
      reportErrorToService(errorObj, context);
    }
  }, []);

  const handleAsyncError = useCallback(async (
    asyncOperation: () => Promise<any>,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error, context, options);
      throw error; // Re-throw so caller can handle if needed
    }
  }, [handleError]);

  const safeExecute = useCallback((
    operation: () => any,
    context?: string,
    options: ErrorHandlerOptions = {}
  ) => {
    try {
      return operation();
    } catch (error) {
      handleError(error, context, options);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    safeExecute,
  };
}

function getErrorMessage(error: Error, context?: string): string {
  // Network errors
  if (error.message.includes('Network') || error.message.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }

  // Permission errors
  if (error.message.includes('permission') || error.message.includes('Permission')) {
    return 'Permission denied. Please check app permissions.';
  }

  // Camera errors
  if (context?.toLowerCase().includes('camera')) {
    return 'Camera error. Please try again.';
  }

  // Payment errors
  if (context?.toLowerCase().includes('payment') || context?.toLowerCase().includes('transaction')) {
    return 'Payment failed. Please try again.';
  }

  // Storage errors
  if (error.message.includes('storage') || error.message.includes('Storage')) {
    return 'Storage error. Please free up space and try again.';
  }

  // Generic error messages
  const genericMessages = [
    'Something went wrong. Please try again.',
    'An unexpected error occurred.',
    'Please try again in a moment.',
  ];

  return genericMessages[Math.floor(Math.random() * genericMessages.length)];
}

function reportErrorToService(error: Error, context?: string) {
  // In a real app, send to crash reporting service
  const errorReport = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    platform: 'react-native',
  };

  console.log('Would report to error service:', errorReport);
  
  // Example integrations:
  // Crashlytics.recordError(error);
  // Sentry.captureException(error, { tags: { context } });
  // Bugsnag.notify(error, { context });
}

// Note: withErrorHandler is commented out to avoid circular import issues
// You can use ComponentErrorBoundary directly from @/components/ErrorBoundaries instead

/*
// Utility function to wrap components with error handling
export function withErrorHandler<T extends object>(
  Component: React.ComponentType<T>,
  componentName?: string
) {
  // This would require importing ErrorBoundary which creates circular dependencies
  // Use ComponentErrorBoundary directly instead
}
*/

import { useCallback } from 'react';
import { useToast } from '@/components/Toast';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastMessage?: string;
  logError?: boolean;
  fallbackAction?: () => void;
}

// Version of useErrorHandler that requires ToastProvider
export function useErrorHandlerWithToast() {
  const { showToast } = useToast();

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

    // Show toast notification
    if (shouldShowToast) {
      const message = toastMessage || getErrorMessage(errorObj, context);
      showToast(message, 'error');
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
  }, [showToast]);

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
}
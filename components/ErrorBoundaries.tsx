import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ErrorBoundary } from './ErrorBoundary';
import { RefreshCw, Wifi, AlertCircle, Camera, CreditCard } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

// Screen-level error boundary for full screen errors
export function ScreenErrorBoundary({ children, screenName }: { children: ReactNode; screenName?: string }) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Screen Error in ${screenName || 'Unknown Screen'}:`, error);
    // Don't use toast here to avoid context issues
  };

  return (
    <ErrorBoundary
      onError={handleError}
      showErrorDetails={__DEV__}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
}

// Component-level error boundary for individual components
export function ComponentErrorBoundary({ 
  children, 
  componentName,
  fallback 
}: { 
  children: ReactNode; 
  componentName?: string;
  fallback?: ReactNode;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const defaultFallback = (
    <View style={[styles.componentError, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <AlertCircle size={24} color="#FF3B30" />
      <Text style={[styles.componentErrorText, { color: isDark ? '#fff' : '#000' }]}>
        {componentName || 'Component'} failed to load
      </Text>
    </View>
  );

  return (
    <ErrorBoundary
      fallback={fallback || defaultFallback}
      onError={(error) => console.error(`Component Error in ${componentName}:`, error)}
    >
      {children}
    </ErrorBoundary>
  );
}

// Network-related error boundary
export function NetworkErrorBoundary({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const networkFallback = (
    <View style={[styles.networkError, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <Wifi size={40} color="#FF9500" />
      <Text style={[styles.networkErrorTitle, { color: isDark ? '#fff' : '#000' }]}>
        Connection Error
      </Text>
      <Text style={[styles.networkErrorSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
        Please check your internet connection
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={16} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ErrorBoundary fallback={networkFallback}>
      {children}
    </ErrorBoundary>
  );
}

// Camera-specific error boundary
export function CameraErrorBoundary({ children, onFallback }: { children: ReactNode; onFallback?: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cameraFallback = (
    <View style={[styles.cameraError, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <Camera size={40} color="#FF3B30" />
      <Text style={[styles.cameraErrorTitle, { color: isDark ? '#fff' : '#000' }]}>
        Camera Unavailable
      </Text>
      <Text style={[styles.cameraErrorSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
        Please check camera permissions
      </Text>
      {onFallback && (
        <TouchableOpacity style={styles.fallbackButton} onPress={onFallback}>
          <Text style={styles.fallbackButtonText}>Use Gallery Instead</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ErrorBoundary fallback={cameraFallback}>
      {children}
    </ErrorBoundary>
  );
}

// Payment-specific error boundary
export function PaymentErrorBoundary({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const paymentFallback = (
    <View style={[styles.paymentError, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <CreditCard size={40} color="#FF3B30" />
      <Text style={[styles.paymentErrorTitle, { color: isDark ? '#fff' : '#000' }]}>
        Payment Error
      </Text>
      <Text style={[styles.paymentErrorSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
        Transaction could not be processed
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={16} color="#fff" />
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ErrorBoundary fallback={paymentFallback}>
      {children}
    </ErrorBoundary>
  );
}

// List item error boundary for handling errors in list items
export function ListItemErrorBoundary({ children, itemId }: { children: ReactNode; itemId?: string }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const listItemFallback = (
    <View style={[styles.listItemError, { backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0' }]}>
      <AlertCircle size={16} color="#FF9500" />
      <Text style={[styles.listItemErrorText, { color: isDark ? '#ccc' : '#666' }]}>
        Item failed to load
      </Text>
    </View>
  );

  return (
    <ErrorBoundary
      fallback={listItemFallback}
      onError={(error) => console.error(`List item error (${itemId}):`, error)}
    >
      {children}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  // Component Error Styles
  componentError: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  componentErrorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },

  // Network Error Styles
  networkError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  networkErrorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  networkErrorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Camera Error Styles
  cameraError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  cameraErrorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  cameraErrorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Payment Error Styles
  paymentError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  paymentErrorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  paymentErrorSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  // List Item Error Styles
  listItemError: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    margin: 5,
    gap: 8,
  },
  listItemErrorText: {
    fontSize: 14,
  },

  // Button Styles
  retryButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fallbackButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
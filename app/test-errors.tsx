import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useErrorHandlerWithToast } from '@/hooks/useErrorHandlerWithToast';
import { router } from 'expo-router';
import {
  ComponentErrorBoundary,
  NetworkErrorBoundary,
  CameraErrorBoundary,
  PaymentErrorBoundary,
  ListItemErrorBoundary,
} from '@/components/ErrorBoundaries';
import { ArrowLeft, Bug, Zap, Wifi, Camera, CreditCard, List } from 'lucide-react-native';

// Component that throws an error for testing
function ErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('This is a test error from ErrorThrowingComponent!');
  }
  return (
    <View style={styles.successComponent}>
      <Text style={styles.successText}>✅ Component loaded successfully!</Text>
    </View>
  );
}

// Network simulation component
function NetworkComponent({ shouldFail }: { shouldFail: boolean }) {
  if (shouldFail) {
    throw new Error('Network request failed: Unable to connect to server');
  }
  return (
    <View style={styles.successComponent}>
      <Text style={styles.successText}>🌐 Network request successful!</Text>
    </View>
  );
}

// Camera simulation component
function CameraComponent({ shouldFail }: { shouldFail: boolean }) {
  if (shouldFail) {
    throw new Error('Camera permission denied or camera not available');
  }
  return (
    <View style={styles.successComponent}>
      <Text style={styles.successText}>📸 Camera initialized successfully!</Text>
    </View>
  );
}

// Payment simulation component
function PaymentComponent({ shouldFail }: { shouldFail: boolean }) {
  if (shouldFail) {
    throw new Error('Payment processing failed: Invalid card details');
  }
  return (
    <View style={styles.successComponent}>
      <Text style={styles.successText}>💳 Payment processed successfully!</Text>
    </View>
  );
}

// List item simulation component
function ListItemComponent({ shouldFail, itemId }: { shouldFail: boolean; itemId: string }) {
  if (shouldFail) {
    throw new Error(`Failed to load list item ${itemId}`);
  }
  return (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>📋 List item {itemId} loaded</Text>
    </View>
  );
}

export default function ErrorTestScreen() {
  const colorScheme = useColorScheme();
  const { handleError, handleAsyncError, safeExecute } = useErrorHandlerWithToast();
  const isDark = colorScheme === 'dark';

  const [componentError, setComponentError] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [listError, setListError] = useState(false);

  const testManualError = () => {
    handleError(
      new Error('This is a manually triggered error'),
      'Manual Error Test',
      {
        toastMessage: 'Manual error triggered for testing!',
        logError: true,
      }
    );
  };

  const testAsyncError = async () => {
    await handleAsyncError(
      async () => {
        throw new Error('Async operation failed');
      },
      'Async Error Test',
      {
        toastMessage: 'Async error handled!',
      }
    );
  };

  const testSafeExecute = () => {
    const result = safeExecute(
      () => {
        throw new Error('Safe execute test error');
      },
      'Safe Execute Test',
      {
        toastMessage: 'Safe execute caught the error!',
      }
    );
    console.log('Safe execute result:', result); // Should be null
  };

  const resetAll = () => {
    setComponentError(false);
    setNetworkError(false);
    setCameraError(false);
    setPaymentError(false);
    setListError(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
          🐛 Error Boundary Testing
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Manual Error Testing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Manual Error Handling
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.testButton} onPress={testManualError}>
              <Bug size={16} color="#fff" />
              <Text style={styles.testButtonText}>Manual Error</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.testButton} onPress={testAsyncError}>
              <Zap size={16} color="#fff" />
              <Text style={styles.testButtonText}>Async Error</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.testButton} onPress={testSafeExecute}>
              <Bug size={16} color="#fff" />
              <Text style={styles.testButtonText}>Safe Execute</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Component Error Boundary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Component Error Boundary
          </Text>
          <TouchableOpacity 
            style={[styles.toggleButton, componentError && styles.errorButton]} 
            onPress={() => setComponentError(!componentError)}
          >
            <Text style={styles.toggleButtonText}>
              {componentError ? 'Fix Component' : 'Break Component'}
            </Text>
          </TouchableOpacity>
          
          <ComponentErrorBoundary componentName="TestComponent">
            <ErrorThrowingComponent shouldThrow={componentError} />
          </ComponentErrorBoundary>
        </View>

        {/* Network Error Boundary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Network Error Boundary
          </Text>
          <TouchableOpacity 
            style={[styles.toggleButton, networkError && styles.errorButton]} 
            onPress={() => setNetworkError(!networkError)}
          >
            <Wifi size={16} color="#fff" />
            <Text style={styles.toggleButtonText}>
              {networkError ? 'Fix Network' : 'Break Network'}
            </Text>
          </TouchableOpacity>
          
          <NetworkErrorBoundary onRetry={() => setNetworkError(false)}>
            <NetworkComponent shouldFail={networkError} />
          </NetworkErrorBoundary>
        </View>

        {/* Camera Error Boundary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Camera Error Boundary
          </Text>
          <TouchableOpacity 
            style={[styles.toggleButton, cameraError && styles.errorButton]} 
            onPress={() => setCameraError(!cameraError)}
          >
            <Camera size={16} color="#fff" />
            <Text style={styles.toggleButtonText}>
              {cameraError ? 'Fix Camera' : 'Break Camera'}
            </Text>
          </TouchableOpacity>
          
          <CameraErrorBoundary onFallback={() => setCameraError(false)}>
            <CameraComponent shouldFail={cameraError} />
          </CameraErrorBoundary>
        </View>

        {/* Payment Error Boundary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Payment Error Boundary
          </Text>
          <TouchableOpacity 
            style={[styles.toggleButton, paymentError && styles.errorButton]} 
            onPress={() => setPaymentError(!paymentError)}
          >
            <CreditCard size={16} color="#fff" />
            <Text style={styles.toggleButtonText}>
              {paymentError ? 'Fix Payment' : 'Break Payment'}
            </Text>
          </TouchableOpacity>
          
          <PaymentErrorBoundary onRetry={() => setPaymentError(false)}>
            <PaymentComponent shouldFail={paymentError} />
          </PaymentErrorBoundary>
        </View>

        {/* List Item Error Boundary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            List Item Error Boundary
          </Text>
          <TouchableOpacity 
            style={[styles.toggleButton, listError && styles.errorButton]} 
            onPress={() => setListError(!listError)}
          >
            <List size={16} color="#fff" />
            <Text style={styles.toggleButtonText}>
              {listError ? 'Fix List Items' : 'Break List Items'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.listContainer}>
            {[1, 2, 3].map((id) => (
              <ListItemErrorBoundary key={id} itemId={`item-${id}`}>
                <ListItemComponent shouldFail={listError} itemId={`${id}`} />
              </ListItemErrorBoundary>
            ))}
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={resetAll}>
          <Text style={styles.resetButtonText}>🔄 Reset All Components</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDark ? '#666' : '#999' }]}>
            Test different error scenarios to see how error boundaries handle them gracefully.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 34,
  },
  headerSpacer: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
    flex: 1,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  errorButton: {
    backgroundColor: '#FF3B30',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  successComponent: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderWidth: 1,
    borderColor: '#34C759',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  successText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    gap: 5,
  },
  listItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 6,
    padding: 12,
  },
  listItemText: {
    color: '#007AFF',
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: '#34C759',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
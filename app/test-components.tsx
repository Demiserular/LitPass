import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

// Import your components
import { SkeletonCard, SkeletonStory, LoadingSpinner, PulseLoading } from '@/components/LoadingStates';
import { ToastProvider, useToast, ToastType } from '@/components/Toast';

// Demo component to test all loading states
function LoadingStatesDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const colorScheme = useColorScheme();

  const toggleLoading = () => {
    setIsLoading(!isLoading);
    if (!isLoading) {
      setTimeout(() => setIsLoading(false), 3000);
    }
  };

  return (
    <View style={[styles.section, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
      <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
        🔄 Loading States
      </Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setShowSkeletons(!showSkeletons)}
      >
        <Text style={styles.buttonText}>
          {showSkeletons ? 'Hide' : 'Show'} Skeleton Loading
        </Text>
      </TouchableOpacity>

      {showSkeletons && (
        <View style={styles.skeletonContainer}>
          <Text style={[styles.label, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
            Event Card Skeletons:
          </Text>
          <SkeletonCard />
          
          <Text style={[styles.label, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
            Story Skeletons:
          </Text>
          <View style={styles.storiesRow}>
            <SkeletonStory />
            <SkeletonStory />
            <SkeletonStory />
            <SkeletonStory />
          </View>
        </View>
      )}

      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
        Spinners:
      </Text>
      <View style={styles.spinnersRow}>
        <View style={styles.spinnerItem}>
          <LoadingSpinner size="small" />
          <Text style={[styles.spinnerLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Small</Text>
        </View>
        <View style={styles.spinnerItem}>
          <LoadingSpinner size="medium" />
          <Text style={[styles.spinnerLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Medium</Text>
        </View>
        <View style={styles.spinnerItem}>
          <LoadingSpinner size="large" color="#007AFF" />
          <Text style={[styles.spinnerLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Large</Text>
        </View>
      </View>

      <Text style={[styles.label, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>
        Pulse Button:
      </Text>
      <PulseLoading isLoading={isLoading}>
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.loadingButton]} 
          onPress={toggleLoading}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Loading...' : 'Test Pulse Loading'}
          </Text>
        </TouchableOpacity>
      </PulseLoading>
    </View>
  );
}

function ToastDemo() {
  const { showToast } = useToast();
  const colorScheme = useColorScheme();

  const toastTests = [
    { type: 'success' as ToastType, label: '✅ Success', message: 'Event booked successfully!' },
    { type: 'error' as ToastType, label: '❌ Error', message: 'Failed to load events. Please try again.' },
    { type: 'warning' as ToastType, label: '⚠️ Warning', message: 'Your session will expire in 5 minutes.' },
    { type: 'info' as ToastType, label: 'ℹ️ Info', message: 'New events available in your area!' },
  ];

  return (
    <View style={[styles.section, { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' }]}>
      <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
        🔔 Toast Notifications
      </Text>

      {toastTests.map(({ type, label, message }) => (
        <TouchableOpacity
          key={type}
          style={[styles.toastButton, { backgroundColor: getToastColor(type) }]}
          onPress={() => showToast(message, type)}
        >
          <Text style={styles.toastButtonText}>{label}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.toastButton, { backgroundColor: '#666' }]}
        onPress={() => showToast('This toast stays for 8 seconds!', 'info', 8000)}
      >
        <Text style={styles.toastButtonText}>🕐 Long Duration (8s)</Text>
      </TouchableOpacity>
    </View>
  );
}

function getToastColor(type: ToastType): string {
  switch (type) {
    case 'success': return '#4CAF50';
    case 'error': return '#F44336';
    case 'warning': return '#FF9800';
    case 'info': return '#2196F3';
    default: return '#2196F3';
  }
}

function ComponentsTestContent() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>
            🧪 Component Testing
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back to App</Text>
          </TouchableOpacity>
        </View>
        
        <LoadingStatesDemo />
        <ToastDemo />
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#666' : '#999' }]}>
            Test all the components above, then integrate them into your app screens!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ComponentsTest() {
  return (
    <ToastProvider>
      <ComponentsTestContent />
    </ToastProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  backButton: {
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  loadingButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  skeletonContainer: {
    marginTop: 10,
  },
  storiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  spinnersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  spinnerItem: {
    alignItems: 'center',
  },
  spinnerLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  toastButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  toastButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
});
import React from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';

export type NavigationTransitionType =
  | 'slide_from_right'
  | 'slide_from_left'
  | 'slide_from_bottom'
  | 'slide_from_top'
  | 'fade'
  | 'flip'
  | 'none';

export interface TransitionConfig {
  animation?: NavigationTransitionType;
  duration?: number;
  gestureEnabled?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal';
}

// Predefined transition configurations
export const transitionPresets = {
  // For regular screen navigation
  default: {
    animation: Platform.select({
      ios: 'slide_from_right',
      android: 'slide_from_right',
      web: 'fade',
    }) as NavigationTransitionType,
    duration: 300,
    gestureEnabled: true,
    presentation: 'card' as const,
  },

  // For tab navigation
  tab: {
    animation: Platform.select({
      ios: 'fade',
      android: 'fade',
      web: 'fade',
    }) as NavigationTransitionType,
    duration: 250,
    gestureEnabled: false,
    presentation: 'card' as const,
  },

  // For modal screens
  modal: {
    animation: 'slide_from_bottom' as NavigationTransitionType,
    duration: 400,
    gestureEnabled: true,
    presentation: 'modal' as const,
  },

  // For quick actions
  quick: {
    animation: 'fade' as NavigationTransitionType,
    duration: 150,
    gestureEnabled: true,
    presentation: 'card' as const,
  },

  // For settings and utility screens
  settings: {
    animation: 'slide_from_bottom' as NavigationTransitionType,
    duration: 350,
    gestureEnabled: true,
    presentation: 'modal' as const,
  },

  // For overlays and alerts
  overlay: {
    animation: 'fade' as NavigationTransitionType,
    duration: 200,
    gestureEnabled: false,
    presentation: 'transparentModal' as const,
  },
} as const;

// Enhanced navigation functions with smooth transitions
export const smoothNavigation = {
  // Navigate to a screen with custom transition
  push: (href: import('expo-router').Href, config: TransitionConfig = transitionPresets.default) => {
    if (typeof href === 'string') {
      router.push(href as any);
    } else {
      router.push(href);
    }
  },

  // Replace current screen
  replace: (href: import('expo-router').Href, config: TransitionConfig = transitionPresets.default) => {
    if (typeof href === 'string') {
      router.replace(href as any);
    } else {
      router.replace(href);
    }
  },

  // Navigate back with transition
  back: (config: TransitionConfig = transitionPresets.default) => {
    router.back();
  },

  // Navigate to modal
  openModal: (href: import('expo-router').Href, config: TransitionConfig = transitionPresets.modal) => {
    if (typeof href === 'string') {
      router.push(href as any);
    } else {
      router.push(href);
    }
  },

  // Navigate to settings
  openSettings: () => {
    router.push('/settings' as any);
  },

  // Navigate to test screens
  openTestComponents: () => {
    router.push('/test-components' as any);
  },

  openTestErrors: () => {
    router.push('/test-errors' as any);
  },

  // Tab navigation with smooth transitions
  switchTab: (tabName: string) => {
    router.push(`/(tabs)/${tabName}` as any);
  },
};

// Hook for managing navigation state and transitions
export function useNavigationTransition() {
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const navigateWithTransition = React.useCallback((
    href: string,
    config: TransitionConfig = transitionPresets.default
  ) => {
    setIsTransitioning(true);

    // Start transition
    router.push(href as any);

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, (config.duration || 300) + 50);
  }, []);

  return {
    isTransitioning,
    navigateWithTransition,
    smoothNavigation,
  };
}

// Gesture configuration for different screen types
export const gestureConfigs = {
  standard: {
    gestureEnabled: true,
    gestureDirection: 'horizontal' as const,
    gestureResponseDistance: 50,
  },

  modal: {
    gestureEnabled: true,
    gestureDirection: 'vertical' as const,
    gestureResponseDistance: 100,
  },

  disabled: {
    gestureEnabled: false,
  },
} as const;
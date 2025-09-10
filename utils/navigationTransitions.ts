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
  push: (href: import('expo-router').Href | string, config: TransitionConfig = transitionPresets.default) => {
    router.push({
      pathname: href,
      params: {
        _transition: config.animation,
        _duration: config.duration?.toString(),
      }
    });
  },

  // Replace current screen
  replace: (href: import('expo-router').Href | string, config: TransitionConfig = transitionPresets.default) => {
    router.replace({
      pathname: href,
      params: {
        _transition: config.animation,
        _duration: config.duration?.toString(),
      }
    });
  },

  // Navigate back with transition
  back: (config: TransitionConfig = transitionPresets.default) => {
    router.back();
  },

  // Navigate to modal
  openModal: (href: import('expo-router').Href | string, config: TransitionConfig = transitionPresets.modal) => {
    router.push({
      pathname: href,
      params: {
        _transition: config.animation,
        _duration: config.duration?.toString(),
        _presentation: config.presentation,
      }
    });
  },

  // Navigate to settings
  openSettings: () => {
    smoothNavigation.openModal('/settings', transitionPresets.settings);
  },

  // Navigate to test screens
  openTestComponents: () => {
    smoothNavigation.openModal('/test-components', transitionPresets.modal);
  },

  openTestErrors: () => {
    smoothNavigation.openModal('/test-errors', transitionPresets.modal);
  },

  // Tab navigation with smooth transitions
  switchTab: (tabName: string) => {
    router.push({
      pathname: `/(tabs)/${tabName}`,
      params: {
        _transition: transitionPresets.tab.animation,
        _duration: transitionPresets.tab.duration?.toString(),
      }
    });
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
    smoothNavigation.push(href, config);
    
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
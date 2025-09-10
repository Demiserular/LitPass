import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

// Custom wrapper to prevent transform style issues in the navigation stack
export function ScreenWrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.wrapper}>
        <View style={styles.inner}>
          {children}
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
    // Force a new stacking context to prevent transform inheritance
    transform: 'none',
    // Ensure wrapper doesn't interfere with layout
    overflow: 'hidden'
  },
  inner: {
    flex: 1,
    // Reset any transforms that might be inherited
    transform: 'none'
  }
});

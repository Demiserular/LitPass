import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

// Skeleton loading component for cards
export function SkeletonCard() {
  const colorScheme = useColorScheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const backgroundColor = colorScheme === 'dark' ? '#333' : '#f0f0f0';
  const shimmerColor = colorScheme === 'dark' ? '#444' : '#e0e0e0';

  return (
    <View style={[styles.skeletonCard, { backgroundColor }]}>
      <Animated.View style={[styles.skeletonImage, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonTitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.skeletonSubtitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        <View style={styles.skeletonFooter}>
          <Animated.View style={[styles.skeletonPrice, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
          <Animated.View style={[styles.skeletonButton, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
        </View>
      </View>
    </View>
  );
}

// Skeleton for story items
export function SkeletonStory() {
  const colorScheme = useColorScheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };
    shimmer();
  }, [shimmerAnimation]);

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const shimmerColor = colorScheme === 'dark' ? '#444' : '#e0e0e0';

  return (
    <View style={styles.skeletonStoryContainer}>
      <Animated.View style={[styles.skeletonStoryImage, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
      <Animated.View style={[styles.skeletonStoryTitle, { backgroundColor: shimmerColor, opacity: shimmerOpacity }]} />
    </View>
  );
}

// Spinner loading component
export function LoadingSpinner({ size = 'medium', color }: { size?: 'small' | 'medium' | 'large', color?: string }) {
  const colorScheme = useColorScheme();
  const spinAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      Animated.timing(spinAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        spinAnimation.setValue(0);
        spin();
      });
    };
    spin();
  }, [spinAnimation]);

  const rotate = spinAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60,
  };

  const spinnerSize = sizeMap[size];
  const spinnerColor = color || (colorScheme === 'dark' ? '#fff' : '#000');

  return (
    <View style={styles.spinnerContainer}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderColor: `${spinnerColor}20`,
            borderTopColor: spinnerColor,
            transform: [{ rotate }],
          },
        ]}
      />
    </View>
  );
}

// Pulse loading for buttons
export function PulseLoading({ children, isLoading }: { children: React.ReactNode, isLoading: boolean }) {
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLoading) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 0.7,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();
    } else {
      pulseAnimation.setValue(1);
    }
  }, [isLoading, pulseAnimation]);

  return (
    <Animated.View style={{ opacity: pulseAnimation }}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Skeleton Card Styles
  skeletonCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  skeletonImage: {
    width: '100%',
    height: 200,
  },
  skeletonContent: {
    padding: 15,
  },
  skeletonTitle: {
    height: 20,
    borderRadius: 4,
    marginBottom: 10,
    width: '70%',
  },
  skeletonSubtitle: {
    height: 16,
    borderRadius: 4,
    marginBottom: 15,
    width: '50%',
  },
  skeletonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skeletonPrice: {
    height: 18,
    width: 60,
    borderRadius: 4,
  },
  skeletonButton: {
    height: 35,
    width: 80,
    borderRadius: 8,
  },

  // Skeleton Story Styles
  skeletonStoryContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  skeletonStoryImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  skeletonStoryTitle: {
    height: 12,
    width: 50,
    borderRadius: 4,
  },

  // Spinner Styles
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  spinner: {
    borderWidth: 3,
    borderRadius: 50,
  },
});
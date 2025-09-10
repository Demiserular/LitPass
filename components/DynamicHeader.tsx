import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme, useThemeColors } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface DynamicHeaderProps {
  scrollY: Animated.Value;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function DynamicHeader({ scrollY }: DynamicHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const themeTransition = useRef(new Animated.Value(0)).current;

  // Responsive sizing based on screen width
  const isLargeScreen = SCREEN_WIDTH > 390; // iPhone 14 Pro and larger
  const isIOS = Platform.OS === 'ios';
  const headerHeight = 44 + (isIOS ? 4 : 0); // Slightly taller on iOS for better alignment
  const fontSize = isLargeScreen ? 30 : 26; // Reduced font size for better spacing
  const horizontalPadding = isLargeScreen ? 20 : 16;

  // Header animation based on scroll
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -headerHeight],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });

  // Theme toggle animation
  useEffect(() => {
    Animated.spring(themeTransition, {
      toValue: theme === 'dark' ? 1 : 0,
      useNativeDriver: false,
      tension: 300,
      friction: 35,
    }).start();
  }, [theme]);

  // Pulse animation for theme toggle
  const startPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleThemeToggle = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    startPulse();
    toggleTheme();
  };

  // Dynamic Island aware styling
  const hasDynamicIsland = Platform.OS === 'ios' && insets.top > 50;
  const blurIntensity = theme === 'dark' ? 20 : 15;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === 'ios' ? 6 : 8,
          paddingHorizontal: horizontalPadding,
          transform: [{ translateY: headerTranslateY }],
          opacity: headerOpacity,
        },
      ]}
    >
      {/* Background Blur - Dynamic Island Style */}
      <View 
        style={[
          styles.blurContainer, 
          { 
            borderRadius: hasDynamicIsland ? 39 : 20,
            marginHorizontal: Platform.OS === 'ios' ? 0 : 4
          }
        ]}
      >
        <BlurView
          intensity={blurIntensity}
          tint={theme === 'dark' ? 'dark' : 'light'}
          style={[StyleSheet.absoluteFill, { borderRadius: hasDynamicIsland ? 39 : 20 }]}
        />
        
        {/* Subtle border for glass effect */}
        <View
          style={[
            styles.glassBorder,
            {
              borderRadius: hasDynamicIsland ? 39 : 20,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            },
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* LitPass Brand */}
        <Text
          style={[
            styles.brandText,
            {
              fontSize,
              color: colors.text,
              fontFamily: Platform.select({
                ios: 'SF Pro Display',
                android: 'sans-serif-light',
                default: 'System',
              }),
            },
          ]}
        >
          LitPass
        </Text>

        {/* Theme Toggle */}
        <TouchableOpacity
          style={[
            styles.themeToggle,
            {
              backgroundColor: theme === 'dark' ? colors.tertiaryBackground : colors.secondaryBackground,
            },
          ]}
          onPress={handleThemeToggle}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.toggleContent,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {theme === 'dark' ? (
              <Sun size={20} color="#FFD700" strokeWidth={2} />
            ) : (
              <Moon size={20} color="#4A90E2" strokeWidth={2} />
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingBottom: Platform.OS === 'ios' ? 10 : 12,
  },
  blurContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 6 : 8,
    left: Platform.OS === 'ios' ? 8 : 16,
    right: Platform.OS === 'ios' ? 8 : 16,
    bottom: 0,
    overflow: 'hidden',
  },
  glassBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Platform.OS === 'ios' ? 12 : 8,
    paddingVertical: Platform.OS === 'ios' ? 10 : 12,
    minHeight: Platform.OS === 'ios' ? 48 : 44,
  },
  brandText: {
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginLeft: Platform.OS === 'ios' ? 4 : 0,
  },
  themeToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: Platform.OS === 'ios' ? 4 : 0,
  },
  toggleContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type TransitionType = 'slide' | 'fade' | 'scale' | 'slideUp' | 'slideDown' | 'flip';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: TransitionType;
  duration?: number;
  isVisible?: boolean;
  onTransitionComplete?: () => void;
}

export function PageTransition({
  children,
  transitionType = 'slide',
  duration = 300,
  isVisible = true,
  onTransitionComplete,
}: PageTransitionProps) {
  const colorScheme = useColorScheme();
  const animation = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  const scaleAnimation = useRef(new Animated.Value(isVisible ? 1 : 0.8)).current;
  const slideAnimation = useRef(new Animated.Value(isVisible ? 0 : screenWidth)).current;
  const slideUpAnimation = useRef(new Animated.Value(isVisible ? 0 : screenHeight)).current;
  const flipAnimation = useRef(new Animated.Value(isVisible ? 0 : 1)).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    switch (transitionType) {
      case 'fade':
        animations.push(
          Animated.timing(animation, {
            toValue: isVisible ? 1 : 0,
            duration,
            useNativeDriver: true,
          })
        );
        break;

      case 'scale':
        animations.push(
          Animated.parallel([
            Animated.timing(animation, {
              toValue: isVisible ? 1 : 0,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation, {
              toValue: isVisible ? 1 : 0.8,
              duration,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'slide':
        animations.push(
          Animated.parallel([
            Animated.timing(animation, {
              toValue: isVisible ? 1 : 0,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnimation, {
              toValue: isVisible ? 0 : screenWidth,
              duration,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'slideUp':
        animations.push(
          Animated.parallel([
            Animated.timing(animation, {
              toValue: isVisible ? 1 : 0,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(slideUpAnimation, {
              toValue: isVisible ? 0 : -screenHeight * 0.1,
              duration,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'slideDown':
        animations.push(
          Animated.parallel([
            Animated.timing(animation, {
              toValue: isVisible ? 1 : 0,
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(slideUpAnimation, {
              toValue: isVisible ? 0 : screenHeight,
              duration,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'flip':
        animations.push(
          Animated.timing(flipAnimation, {
            toValue: isVisible ? 0 : 1,
            duration,
            useNativeDriver: true,
          })
        );
        break;

      default:
        animations.push(
          Animated.timing(animation, {
            toValue: isVisible ? 1 : 0,
            duration,
            useNativeDriver: true,
          })
        );
    }

    Animated.sequence(animations).start(() => {
      onTransitionComplete?.();
    });
  }, [isVisible, transitionType, duration]);

  const getTransformStyle = () => {
    switch (transitionType) {
      case 'scale':
        return {
          opacity: animation,
          transform: [{ scale: scaleAnimation }],
        };

      case 'slide':
        return {
          opacity: animation,
          transform: [{ translateX: slideAnimation }],
        };

      case 'slideUp':
        return {
          opacity: animation,
          transform: [{ translateY: slideUpAnimation }],
        };

      case 'slideDown':
        return {
          opacity: animation,
          transform: [{ translateY: slideUpAnimation }],
        };

      case 'flip':
        const rotateY = flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        });
        return {
          transform: [{ rotateY }],
        };

      case 'fade':
      default:
        return {
          opacity: animation,
        };
    }
  };

  return (
    <Animated.View 
      style={[
        { flex: 1 },
        getTransformStyle(),
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Enhanced screen wrapper with transition support
interface ScreenTransitionProps {
  children: React.ReactNode;
  transitionType?: TransitionType;
  duration?: number;
}

export function ScreenTransition({
  children,
  transitionType = 'slideUp',
  duration = 320,
}: ScreenTransitionProps) {
  return (
    <PageTransition
      transitionType={transitionType}
      duration={duration}
      isVisible={true}
    >
      {children}
    </PageTransition>
  );
}

// Hook for programmatic transitions
export function usePageTransition(initialType: TransitionType = 'fade') {
  const [transitionType, setTransitionType] = React.useState<TransitionType>(initialType);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const startTransition = (type: TransitionType, callback?: () => void) => {
    setIsTransitioning(true);
    setTransitionType(type);
    
    // Simulate transition duration
    setTimeout(() => {
      setIsTransitioning(false);
      callback?.();
    }, 300);
  };

  return {
    transitionType,
    isTransitioning,
    startTransition,
  };
}
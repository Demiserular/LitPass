import React, { useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { Heart, Share, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';

interface SwipeAction {
  icon: React.ComponentType<any>;
  color: string;
  backgroundColor: string;
  onPress: () => void;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function SwipeableCard({ 
  children, 
  leftActions = [], 
  rightActions = [], 
  onSwipeLeft, 
  onSwipeRight 
}: SwipeableCardProps) {
  const colorScheme = useColorScheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      lastOffset.current += translationX;

      // Determine swipe direction and threshold
      const swipeThreshold = 100;
      
      if (translationX > swipeThreshold) {
        // Swiped right
        if (onSwipeRight) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSwipeRight();
        }
        // Animate back to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        lastOffset.current = 0;
      } else if (translationX < -swipeThreshold) {
        // Swiped left
        if (onSwipeLeft) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onSwipeLeft();
        }
        // Animate back to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        lastOffset.current = 0;
      } else {
        // Return to center if threshold not met
        Animated.spring(translateX, {
          toValue: -lastOffset.current,
          useNativeDriver: true,
        }).start();
        translateX.setOffset(lastOffset.current);
        translateX.setValue(0);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.leftActions]}>
          {leftActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <View
                key={index}
                style={[styles.actionButton, { backgroundColor: action.backgroundColor }]}
              >
                <IconComponent size={24} color={action.color} />
              </View>
            );
          })}
        </View>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <View style={[styles.actionsContainer, styles.rightActions]}>
          {rightActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <View
                key={index}
                style={[styles.actionButton, { backgroundColor: action.backgroundColor }]}
              >
                <IconComponent size={24} color={action.color} />
              </View>
            );
          })}
        </View>
      )}

      {/* Main Content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

// Quick swipe actions for common use cases
export const SWIPE_ACTIONS = {
  like: {
    icon: Heart,
    color: '#fff',
    backgroundColor: '#FF6B6B',
    onPress: () => console.log('Liked'),
  },
  share: {
    icon: Share,
    color: '#fff',
    backgroundColor: '#4ECDC4',
    onPress: () => console.log('Shared'),
  },
  bookmark: {
    icon: Bookmark,
    color: '#fff',
    backgroundColor: '#45B7D1',
    onPress: () => console.log('Bookmarked'),
  },
  more: {
    icon: MoreHorizontal,
    color: '#fff',
    backgroundColor: '#96CEB4',
    onPress: () => console.log('More options'),
  },
};

// Pull to refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

export function PullToRefresh({ children, onRefresh, refreshing }: PullToRefreshProps) {
  const colorScheme = useColorScheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const refreshOpacity = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = async (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      
      if (translationY > 100 && !refreshing) {
        // Trigger refresh
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Show refresh indicator
        Animated.timing(refreshOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        // Start rotation animation
        Animated.loop(
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();

        await onRefresh();

        // Hide refresh indicator
        Animated.timing(refreshOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();

        rotateValue.setValue(0);
      }

      // Return to original position
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.pullToRefreshContainer}>
      <Animated.View
        style={[
          styles.refreshIndicator,
          {
            opacity: refreshOpacity,
            transform: [{ rotate }],
          },
        ]}
      >
        <View style={[styles.refreshIcon, { 
          borderColor: colorScheme === 'dark' ? '#fff' : '#000',
          borderTopColor: colorScheme === 'dark' ? '#666' : '#ccc',
        }]} />
      </Animated.View>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.pullToRefreshContent,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  card: {
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 0,
  },
  leftActions: {
    left: 0,
    paddingLeft: 20,
  },
  rightActions: {
    right: 0,
    paddingRight: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  pullToRefreshContainer: {
    flex: 1,
  },
  refreshIndicator: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -15,
    zIndex: 2,
  },
  refreshIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
  },
  pullToRefreshContent: {
    flex: 1,
  },
});
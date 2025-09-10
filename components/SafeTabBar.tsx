import React from 'react';
import { View, StyleSheet, Pressable, Platform, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as Haptics from 'expo-haptics';

/**
 * Custom tab bar wrapper to handle transform styles safely
 */
export function SafeTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const backgroundColor = useThemeColor({ light: '#ffffff80', dark: '#00000080' }, 'background');

  const handlePress = (route: any, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }

    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[styles.inner]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          return (
            <Pressable
              key={route.key}
              onPress={() => handlePress(route, isFocused)}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.pressed
              ]}>
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? (options.tabBarActiveTintColor ?? '#fff') : (options.tabBarInactiveTintColor ?? '#999'),
                size: 24,
              })}
              {options.tabBarShowLabel !== false && (
                <Text style={[
                  styles.label,
                  { color: isFocused ? (options.tabBarActiveTintColor ?? '#fff') : (options.tabBarInactiveTintColor ?? '#999') }
                ]}>
                  {typeof label === 'string' ? label : ''}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 90 : 80,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  }
});

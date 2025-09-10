import React from 'react';
import { View, Platform, useWindowDimensions } from 'react-native';
import normalizeTransform from '../../utils/normalizeTransform';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function BlurTabBarBackground() {
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#000000' }, 'background');
  const { width } = useWindowDimensions();
  
  const isDesktop = Platform.OS === 'web' && width > 768;
  
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        maxWidth: '100%',
        backgroundColor: isDesktop ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.8)',
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: isDesktop ? 0.15 : 0.1,
        shadowRadius: isDesktop ? 6 : 3,
        borderRadius: isDesktop ? 12 : 0,
        marginHorizontal: isDesktop ? 'auto' : 0,
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}

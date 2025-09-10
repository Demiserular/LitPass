import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePathname, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export function BackButton() {
  const navigation = useNavigation();
  const pathname = usePathname();

  const inTabs = pathname?.startsWith('/(tabs)');
  const canGoBack = typeof (navigation as any)?.canGoBack === 'function' ? (navigation as any).canGoBack() : false;

  if (!canGoBack || inTabs) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.button}
        onPress={() => {
          try {
            (navigation as any).goBack?.();
          } catch {
            router.back();
          }
        }}
      >
        <ArrowLeft color="#fff" size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 0,
    zIndex: 1000,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});



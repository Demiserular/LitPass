import { Platform } from 'react-native';

/**
 * Normalizes transform values to match React Native's expected format
 */
function normalizeTransformValue(value: any): number | string | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.endsWith('%')) return value;
  if (typeof value === 'object' && value !== null) {
    // If it's an object like { translateY: 0 }, return the value
    const keys = Object.keys(value);
    if (keys.length === 1 && ['translateY', 'translateX'].includes(keys[0])) {
      return value[keys[0]];
    }
  }
  return undefined;
}

/**
 * Patches the Screen component's transform handling to ensure proper value formatting
 */
export function patchScreenStack() {
  if (Platform.OS !== 'web') return;

  try {
    // Get the Screen component from react-native-screens
    const screens = require('react-native-screens');
    const originalScreen = screens.Screen;

    if (!originalScreen || typeof originalScreen !== 'function') return;

    // Create patched version that normalizes transform values
    screens.Screen = function PatchedScreen(props: any) {
      const patchedProps = { ...props };
      
      if (patchedProps.style?.transform) {
        patchedProps.style = {
          ...patchedProps.style,
          transform: Array.isArray(patchedProps.style.transform) 
            ? patchedProps.style.transform.map((t: any) => {
                if (typeof t !== 'object') return t;
                const key = Object.keys(t)[0];
                return { [key]: normalizeTransformValue(t[key]) };
              })
            : []
        };
      }
      
      return originalScreen(patchedProps);
    };
    screens.Screen.displayName = 'Screen';
  } catch (error) {
    console.warn('Failed to patch Screen component:', error);
  }
}

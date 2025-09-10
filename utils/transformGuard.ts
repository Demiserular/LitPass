import { StyleSheet } from 'react-native';

// Temporary runtime guard to detect malformed transform props (object instead of array)
// It wraps StyleSheet.flatten and inspects the resulting style for `transform` values
// that are not arrays. When found, it logs a warning with a small stack trace to help
// find the offending component.

const originalFlatten = StyleSheet.flatten;

function getShortStack(): string {
  // create an Error to capture stack then trim internal frames
  const err = new Error();
  if (!err.stack) return '';
  const lines = err.stack.split('\n').slice(3, 12); // skip first few internal frames
  return lines.join('\n');
}

function isMalformedTransform(transform: any) {
  if (transform == null) return false;
  if (Array.isArray(transform)) return false;
  // If it's an object with keys like translateY, translateX, rotate, etc, it's malformed
  if (typeof transform === 'object') return true;
  return false;
}

StyleSheet.flatten = function patchedFlatten(style) {
  try {
    const flattened = originalFlatten(style);
    if (flattened && isMalformedTransform((flattened as any).transform)) {
      const bad = (flattened as any).transform;
      // Convert object like { translateY: 0 } into [{ translateY: 0 }]
      try {
        const converted = Object.keys(bad).map((k) => ({ [k]: bad[k] }));
        (flattened as any).transform = converted;
        // eslint-disable-next-line no-console
        console.warn('[transformGuard] Converted malformed transform object to array:', bad, '=>', converted);
        // eslint-disable-next-line no-console
        console.warn('[transformGuard] Component stack (approx):\n', getShortStack());
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[transformGuard] Failed to convert malformed transform, leaving as-is:', bad, e);
      }
    }
    return flattened;
  } catch (e) {
    // If flatten itself throws, rethrow to avoid hiding errors
    throw e;
  }
};

export default function initTransformGuard() {
  // no-op; the module side-effect installs the guard
}

/**
 * Ensure a transform prop is either an array of transform objects or undefined.
 * Accepts:
 * - an array: returned as-is (unless empty -> undefined)
 * - an object like { translateY: 0 }: converted to [{ translateY: 0 }]
 * - null/undefined -> undefined
 * Any unexpected value becomes undefined and is logged for debugging.
 */
export default function normalizeTransform(value: any): Array<Record<string, any>> | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    // Check each transform object is valid
    const validTransform = value.every(obj => {
      if (typeof obj !== 'object') return false;
      const [key, val] = Object.entries(obj)[0];
      return (
        typeof val === 'number' || // Number transforms
        (typeof val === 'string' && val.endsWith('deg')) // Rotation transforms
      );
    });
    return validTransform && value.length > 0 ? value : undefined;
  }

  // eslint-disable-next-line no-console
  console.warn('[normalizeTransform] Transform must be an array of transform objects:', value);
  return undefined;
}

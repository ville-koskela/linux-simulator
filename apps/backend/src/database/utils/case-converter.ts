/**
 * Converts snake_case keys to camelCase
 */
export function toCamelCase<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }

  return result as T;
}

/**
 * Converts an array of snake_case objects to camelCase
 */
export function toCamelCaseArray<T>(arr: Record<string, unknown>[]): T[] {
  return arr.map((obj) => toCamelCase<T>(obj));
}

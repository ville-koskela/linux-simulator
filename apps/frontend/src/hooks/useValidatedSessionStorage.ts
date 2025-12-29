import { useEffect, useState } from "react";
import type { ZodSchema } from "zod";

/**
 * Custom hook for managing state that persists in sessionStorage with Zod validation
 * @param key - The sessionStorage key to use
 * @param initialValue - The initial value to use if no stored value exists
 * @param schema - Zod schema for validating stored data
 * @returns A tuple of [value, setValue] similar to useState
 */
export function useValidatedSessionStorage<T>(
  key: string,
  initialValue: T,
  schema: ZodSchema<T>
): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from session storage by key
      const item = window.sessionStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = JSON.parse(item);
      // Validate against schema
      const validated = schema.safeParse(parsed);

      if (validated.success) {
        return validated.data;
      }

      // Invalid data, remove from storage and return initial value
      window.sessionStorage.removeItem(key);
      return initialValue;
    } catch {
      // If error, return initialValue
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to sessionStorage.
  const setValue = (value: T | ((prev: T) => T)): void => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Validate before storing
      const validated = schema.safeParse(valueToStore);
      if (!validated.success) {
        // Don't store invalid data
        return;
      }

      // Save state
      setStoredValue(validated.data);

      // Save to session storage
      window.sessionStorage.setItem(key, JSON.stringify(validated.data));
    } catch {
      // Silently fail - could be extended to notify users
    }
  };

  // Listen for changes to sessionStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent): void => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue);
          const validated = schema.safeParse(parsed);

          if (validated.success) {
            setStoredValue(validated.data);
          }
        } catch {
          // Silently fail on parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, schema]);

  return [storedValue, setValue];
}

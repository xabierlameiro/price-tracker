"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Sync a state value to localStorage, with SSR safety.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof globalThis.window === "undefined") return initialValue;
    try {
      const item = globalThis.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Keep in sync across tabs
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          // ignore malformed values
        }
      }
    };
    globalThis.addEventListener("storage", handler);
    return () => globalThis.removeEventListener("storage", handler);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        globalThis.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        // Ignore write errors (e.g. private mode, quota exceeded)
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      globalThis.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch {
      // ignore
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

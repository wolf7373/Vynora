import { useState, useEffect } from 'react'

/**
 * Returns a debounced value that only updates after the specified delay.
 * Default delay is 200ms as per Milestone 4 blueprint.
 */
export function useDebounce<T>(value: T, delayMs = 200): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delayMs])

  return debouncedValue
}


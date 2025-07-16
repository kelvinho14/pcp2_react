import { useCallback, useRef } from 'react'

export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastCallTime = useRef<number>(0)

  return useCallback(
    ((...args: any[]) => {
      const now = Date.now()
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // If enough time has passed since last call, execute immediately
      if (now - lastCallTime.current >= delay) {
        lastCallTime.current = now
        callback(...args)
        return
      }

      // Otherwise, debounce the call
      timeoutRef.current = setTimeout(() => {
        lastCallTime.current = Date.now()
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
} 
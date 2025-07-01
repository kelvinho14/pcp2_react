import { useState, useEffect, useCallback } from 'react'

// Breakpoints matching Bootstrap's default breakpoints
const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  currentBreakpoint: Breakpoint
  width: number
}

// Debounce function to prevent excessive updates
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Get current breakpoint based on window width
const getBreakpoint = (width: number): Breakpoint => {
  if (width >= BREAKPOINTS.xxl) return 'xxl'
  if (width >= BREAKPOINTS.xl) return 'xl'
  if (width >= BREAKPOINTS.lg) return 'lg'
  if (width >= BREAKPOINTS.md) return 'md'
  if (width >= BREAKPOINTS.sm) return 'sm'
  return 'xs'
}

// Get responsive state from window width
const getResponsiveState = (width: number): ResponsiveState => {
  const breakpoint = getBreakpoint(width)
  
  return {
    isMobile: width < BREAKPOINTS.md,
    isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    isLargeDesktop: width >= BREAKPOINTS.xl,
    currentBreakpoint: breakpoint,
    width,
  }
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => 
    getResponsiveState(window.innerWidth)
  )

  const updateState = useCallback(
    debounce(() => {
      setState(getResponsiveState(window.innerWidth))
    }, 100),
    []
  )

  useEffect(() => {
    // Set initial state
    setState(getResponsiveState(window.innerWidth))

    // Add resize listener
    window.addEventListener('resize', updateState, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateState)
    }
  }, [updateState])

  return state
}

// Convenience hooks for specific breakpoints
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive()
  return isMobile
}

export const useIsDesktop = (): boolean => {
  const { isDesktop } = useResponsive()
  return isDesktop
}

export const useIsTablet = (): boolean => {
  const { isTablet } = useResponsive()
  return isTablet
}

// Hook for checking if screen is larger than a specific breakpoint
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const { width } = useResponsive()
  return width >= BREAKPOINTS[breakpoint]
}

// Export breakpoints for use in other components
export { BREAKPOINTS } 
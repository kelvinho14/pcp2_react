import { FC, ReactNode, useEffect, useState, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import DoorTransition from './DoorTransition'

interface PageTransitionWrapperProps {
  children: ReactNode
  enableTransition?: boolean
  transitionDuration?: number
  doorColor?: string
}

const PageTransitionWrapper: FC<PageTransitionWrapperProps> = ({
  children,
  enableTransition = true,
  transitionDuration = 1.2,
  doorColor,
}) => {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [showDoorEffect, setShowDoorEffect] = useState(false)
  const [isDoorOpen, setIsDoorOpen] = useState(true)
  const [displayLocation, setDisplayLocation] = useState(location)
  const previousPathRef = useRef(location.pathname)

  useEffect(() => {
    if (!enableTransition) {
      setDisplayLocation(location)
      return
    }

    // Only trigger door effect when:
    // 1. It's a PUSH navigation (user clicked a link, not back/forward/refresh)
    // 2. Location actually changed
    // 3. New location is a dojo page
    
    const isActualNavigation = navigationType === 'PUSH' && location.pathname !== previousPathRef.current
    const isNavigatingToDojo = location.pathname === '/dojo/weak-spots' || location.pathname === '/dojo/practice'
    
    if (isActualNavigation && isNavigatingToDojo) {
      // Play door effect
      setShowDoorEffect(true)
      setIsDoorOpen(true) // Set to true immediately to trigger the drop-then-slide animation

      // Timing breakdown:
      // 1. Drop animation: duration * 0.7 (0.84s) - triggered by DoorTransition when isOpen=true
      // 2. Pause: 0.3s
      // 3. Slide open: duration * 0.3 (0.36s) - triggered automatically by DoorTransition
      
      // Update the content location after a short delay
      const contentTimer = setTimeout(() => {
        setDisplayLocation(location)
        previousPathRef.current = location.pathname
      }, 100)
      
      // Hide door panels after full animation completes
      const hideTimer = setTimeout(() => {
        setShowDoorEffect(false)
      }, transitionDuration * 1000 + 300 + 200) // Drop (840ms) + pause (300ms) + slide (360ms) + buffer (200ms)

      return () => {
        clearTimeout(contentTimer)
        clearTimeout(hideTimer)
      }
    } else {
      // No door effect - just update content
      setDisplayLocation(location)
      previousPathRef.current = location.pathname
    }
  }, [location, navigationType, enableTransition, transitionDuration])

  return (
    <>
      {showDoorEffect && (
        <DoorTransition
          isOpen={isDoorOpen}
          duration={transitionDuration}
          doorColor={doorColor}
        />
      )}
      <div key={displayLocation.pathname}>{children}</div>
    </>
  )
}

export default PageTransitionWrapper


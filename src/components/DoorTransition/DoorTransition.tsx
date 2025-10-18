import { motion } from 'framer-motion'
import { FC, ReactNode, useState, useEffect } from 'react'
import './DoorTransition.css'

interface DoorTransitionProps {
  isOpen: boolean
  children?: ReactNode
  onComplete?: () => void
  duration?: number
  doorColor?: string
}

const DoorTransition: FC<DoorTransitionProps> = ({
  isOpen,
  children,
  onComplete,
  duration = 1.2,
  doorColor = '#f5f1e8', // Very light brown for shoji paper
}) => {
  const [isDropped, setIsDropped] = useState(false)
  const [isSliding, setIsSliding] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // When opening: first drop (doors closed), then slide
      setIsDropped(true)
      setIsSliding(false)
      
      const slideTimer = setTimeout(() => {
        setIsDropped(false)
        setIsSliding(true)
      }, duration * 700) // Wait for drop animation to complete
      
      return () => clearTimeout(slideTimer)
    } else {
      // When closing: reset immediately
      setIsDropped(false)
      setIsSliding(false)
    }
  }, [isOpen, duration])

  return (
    <div className="door-container">
      {/* Left Door Panel with drop then slide animation */}
      <motion.div
        className="door-panel door-left"
        initial={{ x: 0, y: '-100%' }}
        animate={{ 
          x: isSliding ? '-100%' : 0, // Only slide when isSliding is true
          y: 0
        }}
        transition={{
          duration: isSliding ? duration * 0.3 : duration * 0.7, // Shorter duration for slide, longer for drop
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
        onAnimationComplete={() => {
          if (isOpen && onComplete) onComplete()
        }}
        style={{
          backgroundColor: doorColor,
        }}
      >
        {/* Door frame details */}
        <div className="door-frame"></div>
        <div className="door-panels-inner">
          <div className="door-panel-section"></div>
          <div className="door-panel-section"></div>
        </div>
        {/* Door handle */}
        <div className="door-handle door-handle-left"></div>
        
        {!isOpen && children && (
          <div className="door-content">
            {children}
          </div>
        )}
      </motion.div>

      {/* Right Door Panel with drop then slide animation */}
      <motion.div
        className="door-panel door-right"
        initial={{ x: 0, y: '-100%' }}
        animate={{ 
          x: isSliding ? '100%' : 0, // Only slide when isSliding is true
          y: 0
        }}
        transition={{
          duration: isSliding ? duration * 0.3 : duration * 0.7, // Shorter duration for slide, longer for drop
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
        style={{
          backgroundColor: doorColor,
        }}
      >
        {/* Door frame details */}
        <div className="door-frame"></div>
        <div className="door-panels-inner">
          <div className="door-panel-section"></div>
          <div className="door-panel-section"></div>
        </div>
        {/* Door handle */}
        <div className="door-handle door-handle-right"></div>
        
        {!isOpen && children && (
          <div className="door-content">
            {children}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default DoorTransition


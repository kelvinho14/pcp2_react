import React, { forwardRef, useEffect, useRef } from 'react'
import { DrawingPadCanvasProps } from './types'
import './DrawingPadCanvas.css'

const DrawingPadCanvas = forwardRef<HTMLCanvasElement, DrawingPadCanvasProps>(({
  width = 800,
  height = 600,
  background = 'white',
  className = '',
  style = {}
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        // Set canvas size
        canvas.width = width
        canvas.height = height
        
        // Set background
        ctx.fillStyle = background
        ctx.fillRect(0, 0, width, height)
      }
    }
  }, [width, height, background])

  return (
    <canvas
      ref={node => {
        // Handle both forwardRef and internal ref
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(ref as any).current = node
        }
        if (node) {
          canvasRef.current = node
        }
      }}
      className={`drawing-pad-canvas ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: '1px solid #ccc',
        cursor: 'crosshair',
        ...style
      }}
    />
  )
})

DrawingPadCanvas.displayName = 'DrawingPadCanvas'

export default DrawingPadCanvas 
// Add Zwibbler types
declare global {
  interface Window {
    Zwibbler: any
  }
}

export interface DrawingPadProps {
  width?: number
  height?: number
  onExport?: (format: 'png' | 'jpg' | 'pdf') => void
  className?: string
  filename?: string
} 
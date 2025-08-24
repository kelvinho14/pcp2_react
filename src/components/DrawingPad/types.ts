// Add Zwibbler types
declare global {
  interface Window {
    Zwibbler: any
  }
}

export interface DrawingPadProps {
  width: number
  height: number
  questionId: string
  saveFunction: (questionId: string, questionType: number, answerData: any) => Promise<void>
  className?: string
  backgroundImageUrl?: string
  initialDrawingData?: string // Zwibbler JSON data to load initially
  title?: string // Optional title to display above the drawing pad
  description?: string // Optional description text below the title
}

export interface DrawingPadRef {
  getZwibblerContext: () => any
  getDrawingData: () => Promise<any>
  clearDrawing: () => void
} 
// Add Zwibbler types
declare global {
  interface Window {
    Zwibbler: any
  }
}

export interface DrawingPadProps {
  width?: number
  height?: number
  onExport?: (data: any) => void
  className?: string
  filename?: string
  saveFunction?: (questionId: string, questionType: number, answerData: any) => Promise<void>
  questionId?: string
  onLoadDrawing?: (jsonData: string) => void
  onLoadFile?: (file: File) => void
  initialData?: string | null
} 
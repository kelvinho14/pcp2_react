import React from 'react'

export interface DrawingPadProps {
  id?: string
  showToolbar?: boolean
  defaultBrushWidth?: number
  showPropertyPanel?: boolean
  background?: string
  snap?: number
  pageView?: boolean
  showColourPanel?: boolean
  width?: number
  height?: number
  onSave?: (data: string) => void
  onExport?: (format: 'pdf' | 'png' | 'jpg') => void
  className?: string
}

export interface DrawingPadToolbarProps {
  onPenSelect?: (width: number, color: string, opacity: number) => void
  onBrushSelect?: (width: number, color: string, opacity: number) => void
  onEraserSelect?: (width: number) => void
  onLineSelect?: () => void
  onPickSelect?: () => void
  onPanSelect?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onClear?: () => void
  onExport?: (format: 'pdf' | 'png' | 'jpg') => void
  onInsertImage?: () => void
  onSetPaperSize?: (orientation: 'landscape' | 'portrait') => void
  onResetZoom?: () => void
  currentTool?: string
  brushType?: string
  isDirty?: boolean
  className?: string
}

export interface ColourPaletteProps {
  onColourSelect?: (colour: string) => void
  onOpacityChange?: (opacity: number) => void
  currentColour?: string
  currentOpacity?: number
  className?: string
}

export interface LineWidthSelectorProps {
  onWidthChange?: (width: number) => void
  currentWidth?: number
  className?: string
}

export interface DrawingPadCanvasProps {
  width?: number
  height?: number
  background?: string
  className?: string
  style?: React.CSSProperties
}

export interface DrawingPadState {
  currentTool: string
  brushType: string
  currentColour: string
  currentOpacity: number
  lineWidth: number
  isDirty: boolean
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
}

export interface DrawingPadContext {
  state: DrawingPadState
  setState: React.Dispatch<React.SetStateAction<DrawingPadState>>
  usePen: (width: number, color: string, opacity: number) => void
  useBrush: (width: number, color: string, opacity: number) => void
  useEraser: (width: number) => void
  useLineTool: () => void
  usePickTool: () => void
  usePanTool: () => void
  undo: () => void
  redo: () => void
  clear: () => void
  export: (format: 'pdf' | 'png' | 'jpg') => void
  insertImage: () => void
  setPaperSize: (orientation: 'landscape' | 'portrait') => void
  resetZoom: () => void
  download: (format: 'pdf' | 'png' | 'jpg', filename: string) => void
  dirty: () => boolean
  getCurrentTool: () => string
} 
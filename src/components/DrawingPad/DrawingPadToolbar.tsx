import React from 'react'
import { DrawingPadToolbarProps } from './types'
import './DrawingPadToolbar.css'

const DrawingPadToolbar: React.FC<DrawingPadToolbarProps> = ({
  onPenSelect,
  onBrushSelect,
  onEraserSelect,
  onLineSelect,
  onPickSelect,
  onPanSelect,
  onUndo,
  onRedo,
  onClear,
  onExport,
  onInsertImage,
  onSetPaperSize,
  onResetZoom,
  currentTool = 'brush',
  brushType = 'pen',
  isDirty = false,
  className = ''
}) => {
  return (
    <div className={`drawing-pad-toolbar ${className}`}>
      <div className="toolbar-section">
        {/* Pen Tools */}
        <button
          className={`toolbar-button ${currentTool === 'brush' && brushType === 'pen' ? 'active' : ''}`}
          onClick={() => onPenSelect?.(4, '#3ec996', 1)}
          title="Pen Tool"
        >
          <i className="fas fa-pen-to-square"></i>
        </button>
        
        <button
          className={`toolbar-button ${currentTool === 'brush' && brushType === 'brush' ? 'active' : ''}`}
          onClick={() => onBrushSelect?.(1, '#000000', 1)}
          title="Brush Tool"
        >
          <i className="fas fa-pencil-alt"></i>
        </button>

        {/* Line Tool */}
        <button
          className={`toolbar-button ${currentTool === 'line' ? 'active' : ''}`}
          onClick={onLineSelect}
          title="Line Tool"
        >
          <i className="fas fa-minus"></i>
        </button>

        {/* Eraser Tools */}
        <button
          className={`toolbar-button ${currentTool === 'brush' && brushType === 'eraser' ? 'active' : ''}`}
          onClick={() => onEraserSelect?.(20)}
          title="Eraser (Small)"
        >
          <i className="fas fa-eraser"></i>
        </button>
        
        <button
          className={`toolbar-button ${currentTool === 'brush' && brushType === 'eraser' ? 'active' : ''}`}
          onClick={() => onEraserSelect?.(50)}
          title="Eraser (Large)"
        >
          <i className="fas fa-eraser"></i>
        </button>

        {/* Selection and Pan Tools */}
        <button
          className={`toolbar-button ${currentTool === 'pick' ? 'active' : ''}`}
          onClick={onPickSelect}
          title="Select Tool"
        >
          <i className="fas fa-mouse-pointer"></i>
        </button>

        <button
          className={`toolbar-button ${currentTool === 'pan' ? 'active' : ''}`}
          onClick={onPanSelect}
          title="Pan & Zoom"
        >
          <i className="fas fa-hand-paper"></i>
        </button>
      </div>

      <div className="toolbar-section">
        {/* Undo/Redo */}
        <button
          className="toolbar-button"
          onClick={onUndo}
          title="Undo"
        >
          <i className="fas fa-undo"></i>
        </button>
        
        <button
          className="toolbar-button"
          onClick={onRedo}
          title="Redo"
        >
          <i className="fas fa-redo"></i>
        </button>
      </div>

      <div className="toolbar-section">
        {/* Clear */}
        <button
          className={`toolbar-button ${!isDirty ? 'disabled' : ''}`}
          onClick={onClear}
          disabled={!isDirty}
          title="Clear Canvas"
        >
          <i className="fas fa-trash-alt"></i>
        </button>

        {/* Insert Image */}
        <button
          className="toolbar-button"
          onClick={onInsertImage}
          title="Insert Image"
        >
          <i className="fas fa-image"></i>
        </button>
      </div>

      <div className="toolbar-section">
        {/* Paper Size */}
        <button
          className="toolbar-button"
          onClick={() => onSetPaperSize?.('landscape')}
          title="Landscape"
        >
          <i className="fas fa-ruler-horizontal"></i>
        </button>
        
        <button
          className="toolbar-button"
          onClick={() => onSetPaperSize?.('portrait')}
          title="Portrait"
        >
          <i className="fas fa-ruler-vertical"></i>
        </button>

        {/* Zoom Reset */}
        <button
          className="toolbar-button"
          onClick={onResetZoom}
          title="Reset Zoom"
        >
          <i className="fas fa-expand"></i>
        </button>
      </div>

      <div className="toolbar-section">
        {/* Export */}
        <button
          className="toolbar-button"
          onClick={() => onExport?.('pdf')}
          title="Export as PDF"
        >
          <i className="fas fa-download"></i>
        </button>
      </div>
    </div>
  )
}

export default DrawingPadToolbar 
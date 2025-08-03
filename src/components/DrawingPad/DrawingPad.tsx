import React, { useState, useRef, useCallback, useEffect } from 'react'
import { DrawingPadProps } from './types'
import './DrawingPad.css'

// Add Zwibbler types
declare global {
  interface Window {
    Zwibbler: any
  }
}

const DrawingPad: React.FC<DrawingPadProps> = ({
  width = 800,
  height = 600,
  onExport,
  className = ''
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zwibblerCtx, setZwibblerCtx] = useState<any>(null)
  const [zwibblerInstance, setZwibblerInstance] = useState<any>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showThicknessPicker, setShowThicknessPicker] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentThickness, setCurrentThickness] = useState(4)
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser' | 'line' | 'pick' | 'pan'>('pen')

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showColorPicker && !target.closest('.color-picker-container')) {
        setShowColorPicker(false)
      }
      if (showThicknessPicker && !target.closest('.thickness-picker-container')) {
        setShowThicknessPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker, showThicknessPicker])

  // Zwibbler initialization
  useEffect(() => {
    if (!canvasRef.current || !window.Zwibbler) return

    console.log('Initializing Zwibbler with canvas ref:', canvasRef.current)

    try {
      // Initialize Zwibbler with the same approach as the HTML reference
      const zwibbler = window.Zwibbler.create(canvasRef.current, {
        showToolbar: false,
        defaultBrushWidth: 4,
        showPropertyPanel: false,
        background: 'white',
        snap: 20,
        pageView: true,
        showColourPanel: false
      })

      const ctx = zwibbler.ctx
      setZwibblerCtx(ctx)
      setZwibblerInstance(zwibbler)

      console.log('Zwibbler initialized successfully, ctx:', ctx)

      // Set up the canvas like in the HTML reference
      if (ctx) {
        // Set paper size to A4 portrait
        ctx.setPaperSize('A4', false)
        console.log('Paper size set to A4 portrait')

        // Set up background like in the HTML reference
        ctx.useSinglelineBackground = () => {
          ctx.setConfig('background', 'image')
          ctx.setConfig('backgroundImage', 'https://app.myplp.io/chem/theme/assets/singleline_paper_2.jpg')
        }
        
        // Call the background function
        ctx.useSinglelineBackground()
        console.log('Singleline background set')

        // Set page placement and zoom like in the HTML reference
        ctx.setConfig('pagePlacement', 'centre')
        ctx.setZoom(0.6)
        console.log('Page placement and zoom set')

        // Set up colors like in the HTML reference
        ctx.colours = [
          '#000',
          '#f7412d',
          '#47b04b',
          '#1194f6',
          '#ffc200',
          '#9d1bb2',
          '#ec1561',
          '#7a5547'
        ]

        // Set initial brush tool like in the HTML reference
        ctx.useBrushTool('#3ec996', 4)
        console.log('Initial brush tool set')
      }
    } catch (error) {
      console.error('Error initializing Zwibbler:', error)
    }
  }, [])

  // Tool functions
  const usePen = useCallback((width: number, color: string, type: number) => {
    console.log('usePen called with:', width, color, type)
    
    // Set the correct tool based on type
    if (type === 2) {
      setCurrentTool('highlighter')
    } else {
      setCurrentTool('pen')
    }
    
    if (zwibblerCtx) {
      // Match the HTML reference approach
      let finalColor = color
      if (type === 2) {
        // Highlighter - make color semi-transparent
        finalColor = window.Zwibbler.setColourOpacity(color, 0.5)
      }
      zwibblerCtx.useBrushTool(finalColor, width)
      console.log('Pen tool activated with:', finalColor, width)
    }
  }, [zwibblerCtx])

  // Helper function to find tool methods
  const findToolMethods = useCallback(() => {
    if (zwibblerCtx) {
      const protoMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(zwibblerCtx))
      console.log('All available tool methods:', protoMethods.filter(m => 
        m.toLowerCase().includes('tool') || 
        m.toLowerCase().includes('brush') || 
        m.toLowerCase().includes('pen') || 
        m.toLowerCase().includes('eraser') || 
        m.toLowerCase().includes('line') || 
        m.toLowerCase().includes('pick') || 
        m.toLowerCase().includes('pan') ||
        m.toLowerCase().includes('shape')
      ))
    }
  }, [zwibblerCtx])

  const useHighlighter = useCallback(() => {
    console.log('useHighlighter called')
    setCurrentTool('highlighter')
    if (zwibblerCtx) {
      const color = window.Zwibbler.setColourOpacity(currentColor, 0.5)
      zwibblerCtx.useBrushTool(color, currentThickness)
      console.log('Highlighter tool activated')
    }
  }, [zwibblerCtx, currentColor, currentThickness])

  const useEraser = useCallback(() => {
    console.log('useEraser called')
    setCurrentTool('eraser')
    if (zwibblerCtx) {
      zwibblerCtx.useBrushTool({ lineWidth: currentThickness, strokeStyle: 'erase' })
      console.log('Eraser tool activated')
    }
  }, [zwibblerCtx, currentThickness])

  const useLineTool = useCallback(() => {
    console.log('useLineTool called')
    setCurrentTool('line')
    if (zwibblerCtx) {
      zwibblerCtx.useLineTool()
      console.log('Line tool activated')
    }
  }, [zwibblerCtx])

  const usePickTool = useCallback(() => {
    console.log('usePickTool called')
    setCurrentTool('pick')
    if (zwibblerCtx) {
      zwibblerCtx.usePickTool()
      console.log('Pick tool activated')
    }
  }, [zwibblerCtx])

  // Function to force redraw
  const forceRedraw = useCallback(() => {
    console.log('forceRedraw called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.redraw === 'function') {
      zwibblerCtx.redraw()
      console.log('Canvas redrawn')
    } else if (zwibblerCtx && typeof zwibblerCtx.refresh === 'function') {
      zwibblerCtx.refresh()
      console.log('Canvas refreshed')
    } else if (zwibblerInstance && typeof zwibblerInstance.redraw === 'function') {
      zwibblerInstance.redraw()
      console.log('Canvas redrawn on instance')
    } else if (zwibblerInstance && typeof zwibblerInstance.refresh === 'function') {
      zwibblerInstance.refresh()
      console.log('Canvas refreshed on instance')
    }
  }, [zwibblerCtx, zwibblerInstance])

  // Function to clear background properly
  const clearBackgroundProperly = useCallback(() => {
    console.log('clearBackgroundProperly called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.setConfig === 'function') {
      // Set background color to grey
      zwibblerCtx.setConfig('background', '#f0f0f0')
      console.log('Background set to grey')
    } else if (zwibblerInstance && typeof zwibblerInstance.setConfig === 'function') {
      zwibblerInstance.setConfig('background', '#f0f0f0')
      console.log('Background set to grey on instance')
    } else if (zwibblerCtx && typeof zwibblerCtx.setPageBackground === 'function') {
      // Try to clear page background and let the default background show
      zwibblerCtx.setPageBackground(0, '')
      console.log('Page background cleared')
    } else if (zwibblerInstance && typeof zwibblerInstance.setPageBackground === 'function') {
      zwibblerInstance.setPageBackground(0, '')
      console.log('Page background cleared on instance')
    }
  }, [zwibblerCtx, zwibblerInstance])

  // Function to restore paper background
  const restorePaperBackground = useCallback(() => {
    console.log('restorePaperBackground called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.setPageBackground === 'function') {
      // Restore the paper background
      zwibblerCtx.setPageBackground(0, 'https://app.myplp.io/chem/theme/assets/singleline_paper_2.jpg')
      console.log('Paper background restored')
    } else if (zwibblerInstance && typeof zwibblerInstance.setPageBackground === 'function') {
      zwibblerInstance.setPageBackground(0, 'https://app.myplp.io/chem/theme/assets/singleline_paper_2.jpg')
      console.log('Paper background restored on instance')
    }
  }, [zwibblerCtx, zwibblerInstance])

  const usePanTool = useCallback(() => {
    console.log('usePanTool called')
    setCurrentTool('pan')
    if (zwibblerCtx) {
      zwibblerCtx.usePanTool()
      console.log('Pan tool activated')
    }
  }, [zwibblerCtx])

  // Function to clear background
  const clearBackground = useCallback(() => {
    console.log('clearBackground called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.setConfig === 'function') {
      zwibblerCtx.setConfig('backgroundColor', '#f0f0f0')
      console.log('Background cleared')
    } else if (zwibblerInstance && typeof zwibblerInstance.setConfig === 'function') {
      zwibblerInstance.setConfig('backgroundColor', '#f0f0f0')
      console.log('Background cleared on instance')
    }
  }, [zwibblerCtx, zwibblerInstance])

  // Color and thickness selection
  const selectColor = useCallback((color: string) => {
    setCurrentColor(color)
    
    if (zwibblerCtx) {
      // Match the HTML reference approach
      let finalColor = color
      if (currentTool === 'highlighter') {
        finalColor = window.Zwibbler.setColourOpacity(color, 0.5)
      }
      
      // Set the color using Zwibbler's setColour method
      zwibblerCtx.setColour(finalColor, true)
      
      // Also update the brush tool with the new color
      if (currentTool === 'highlighter') {
        zwibblerCtx.useBrushTool(finalColor, currentThickness)
      } else if (currentTool === 'eraser') {
        zwibblerCtx.useBrushTool({ lineWidth: currentThickness, strokeStyle: 'erase' })
      } else {
        zwibblerCtx.useBrushTool(finalColor, currentThickness)
      }
    }
  }, [zwibblerCtx, currentTool, currentThickness])

  const selectThickness = useCallback((thickness: number) => {
    setCurrentThickness(thickness)
    
    if (zwibblerCtx) {
      // Update the brush tool with new thickness
      if (currentTool === 'highlighter') {
        const color = window.Zwibbler.setColourOpacity(currentColor, 0.5)
        zwibblerCtx.useBrushTool(color, thickness)
      } else if (currentTool === 'eraser') {
        zwibblerCtx.useBrushTool({ lineWidth: thickness, strokeStyle: 'erase' })
      } else {
        zwibblerCtx.useBrushTool(currentColor, thickness)
      }
    }
  }, [zwibblerCtx, currentTool, currentColor])

  // Undo/Redo
  const undo = useCallback(() => {
    console.log('undo called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.undo === 'function') {
      zwibblerCtx.undo()
      console.log('Using Zwibbler undo')
    } else {
      console.log('Zwibbler undo not available')
    }
  }, [zwibblerCtx])

  const redo = useCallback(() => {
    console.log('redo called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.redo === 'function') {
      zwibblerCtx.redo()
      console.log('Using Zwibbler redo')
    } else {
      console.log('Zwibbler redo not available')
    }
  }, [zwibblerCtx])

  // Clear everything
  const clear = useCallback(() => {
    console.log('clear called, zwibblerCtx:', zwibblerCtx)
    
    if (zwibblerCtx && confirm("Clear entire drawing?")) {
      zwibblerCtx.begin()
      let numPages = zwibblerCtx.getPageCount()
      for(let i = numPages-1; i >= 0; i--) {
        zwibblerCtx.deletePage(i)
      }
      zwibblerCtx.commit()
      
      // Recreate the background function exactly like in initialization
      zwibblerCtx.useSinglelineBackground = () => {
        zwibblerCtx.setConfig('background', 'image')
        zwibblerCtx.setConfig('backgroundImage', 'https://app.myplp.io/chem/theme/assets/singleline_paper_2.jpg')
      }
      
      // Call the background function
      zwibblerCtx.useSinglelineBackground()
      console.log('Background restored after clear')
    }
  }, [zwibblerCtx])

  // Paper size functions
  const setLandscape = useCallback(() => {
    console.log('setLandscape called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.setPaperSize === 'function') {
      zwibblerCtx.setPaperSize('A4', true) // true = landscape
      console.log('Using Zwibbler landscape')
    } else {
      console.log('Zwibbler landscape not available')
    }
  }, [zwibblerCtx])

  const setPortrait = useCallback(() => {
    console.log('setPortrait called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.setPaperSize === 'function') {
      zwibblerCtx.setPaperSize('A4', false) // false = portrait
      console.log('Using Zwibbler portrait')
    } else {
      console.log('Zwibbler portrait not available')
    }
  }, [zwibblerCtx])

  // Insert image
  const insertImage = useCallback(() => {
    console.log('insertImage called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.insertImage === 'function') {
      zwibblerCtx.insertImage()
      console.log('Using Zwibbler insert image')
    } else {
      console.log('Zwibbler insert image not available')
    }
  }, [zwibblerCtx])

  // Download/Export
  const download = useCallback(() => {
    console.log('download called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.download === 'function') {
      zwibblerCtx.download('pdf', 'LiveDrawing.pdf')
      console.log('Using Zwibbler download')
    } else {
      console.log('Zwibbler download not available')
    }
  }, [zwibblerCtx])

  // Reset zoom
  const resetZoom = useCallback(() => {
    console.log('resetZoom called, zwibblerCtx:', zwibblerCtx)
    if (zwibblerCtx && typeof zwibblerCtx.resetZoom === 'function') {
      zwibblerCtx.resetZoom()
      console.log('Using Zwibbler reset zoom')
    } else {
      console.log('Zwibbler reset zoom not available')
    }
  }, [zwibblerCtx])

  return (
    <div className={`drawing-pad ${className}`}>
      <div className="drawing-pad-container">
        {/* Toolbar */}
        <div className="drawing-pad-toolbar">
          <div className="toolbar-section">
            {/* Pen tools */}
            <button 
              className={`tool-button ${currentTool === 'highlighter' ? 'active highlighter' : ''}`}
              onClick={() => usePen(currentThickness, currentColor, 2)}
              title="Highlighter"
            >
              <i className="fas fa-pen-to-square"></i>
            </button>
            <button 
              className={`tool-button ${currentTool === 'pen' ? 'active' : ''}`}
              onClick={() => usePen(currentThickness, currentColor, 1)}
              title="Pen"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
            
            {/* Color picker with dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                className="tool-button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Color Palette"
              >
                <i className="fas fa-palette"></i>
              </button>
              {showColorPicker && (
                <div className="color-picker-dropdown">
                  {['#000000', '#f7412d', '#47b04b', '#1194f6', '#ffc200', '#9d1bb2', '#ec1561', '#7a5547'].map(color => (
                    <button
                      key={color}
                      className="color-option"
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        selectColor(color)
                        setShowColorPicker(false)
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thickness picker with dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                className="tool-button"
                onClick={() => setShowThicknessPicker(!showThicknessPicker)}
                title="Brush Thickness"
              >
                <i className="fas fa-paintbrush"></i>
              </button>
              {showThicknessPicker && (
                <div className="thickness-picker-dropdown">
                  {[1, 2, 4, 6, 8, 12].map(thickness => (
                    <button
                      key={thickness}
                      className="thickness-option"
                      onClick={(e) => {
                        e.stopPropagation()
                        selectThickness(thickness)
                        setShowThicknessPicker(false)
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                      }}
                    >
                      <div className="thickness-preview" style={{ height: `${thickness}px` }}></div>
                      <span>{thickness}px</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="toolbar-section">
            {/* Drawing tools */}
            <button 
              className={`tool-button ${currentTool === 'line' ? 'active' : ''}`}
              onClick={useLineTool}
              title="Line"
            >
              <i className="fas fa-minus"></i>
            </button>
            <button 
              className={`tool-button ${currentTool === 'eraser' ? 'active' : ''}`}
              onClick={useEraser}
              title="Eraser"
            >
              <i className="fas fa-eraser"></i>
            </button>
            <button 
              className="tool-button"
              onClick={resetZoom}
              title="Reset zoom"
            >
              <i className="fas fa-expand"></i>
            </button>
            <button 
              className="tool-button"
              onClick={download}
              title="Export"
            >
              <i className="fas fa-download"></i>
            </button>
            <button 
              className="tool-button"
              onClick={clear}
              title="Clear"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
            <button 
              className={`tool-button ${currentTool === 'pick' ? 'active' : ''}`}
              onClick={usePickTool}
              title="Select"
            >
              <i className="fas fa-mouse-pointer"></i>
            </button>
            <button 
              className="tool-button"
              onClick={undo}
              title="Undo"
            >
              <i className="fas fa-undo"></i>
            </button>
            <button 
              className="tool-button"
              onClick={redo}
              title="Redo"
            >
              <i className="fas fa-redo"></i>
            </button>
            <button 
              className="tool-button"
              onClick={insertImage}
              title="Insert image"
            >
              <i className="fas fa-image"></i>
            </button>
            <button 
              className="tool-button"
              onClick={setLandscape}
              title="Landscape"
            >
              <i className="fas fa-ruler-horizontal"></i>
            </button>
            <button 
              className="tool-button"
              onClick={setPortrait}
              title="Portrait"
            >
              <i className="fas fa-ruler-vertical"></i>
            </button>
            <button 
              className={`tool-button ${currentTool === 'pan' ? 'active' : ''}`}
              onClick={usePanTool}
              title="Pan & zoom"
            >
              <i className="fas fa-hand-paper"></i>
            </button>
          </div>
        </div>
        
        <div className="drawing-pad-main">
          {/* Zwibbler canvas container */}
          <div 
            ref={canvasRef}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              border: '2px solid #333',
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 0 0 1px #ccc',
              margin: '0 auto',
              display: 'block',
              borderRadius: '2px',
              position: 'relative',
              overflow: 'hidden'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default DrawingPad 
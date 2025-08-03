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
  height = 800, // Increased from 600 to 800 for taller canvas
  onExport,
  className = '',
  filename = 'Drawing.pdf',
  saveFunction,
  questionId,
  initialData
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zwibblerCtx, setZwibblerCtx] = useState<any>(null)
  const [zwibblerInstance, setZwibblerInstance] = useState<any>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showThicknessPicker, setShowThicknessPicker] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentThickness, setCurrentThickness] = useState(4)
  const [currentTool, setCurrentTool] = useState<'pen' | 'highlighter' | 'eraser' | 'line' | 'pick' | 'pan' | 'text'>('pen')
  const changeCountRef = useRef(0)
  const onDocumentChangedRef = useRef<(() => void) | null>(null)
  const stableCtxRef = useRef<any>(null)

  // Document change handler
  const onDocumentChanged = useCallback(() => {
    changeCountRef.current += 1
    
    if (changeCountRef.current >= 5) {
      // Use the stable context reference
      const ctx = stableCtxRef.current || zwibblerInstance?.ctx || zwibblerCtx
      
      if (ctx && typeof ctx.save === 'function') {
        try {
          const savedContent = ctx.save('zwibbler3')
          
          // Call the save API with the drawing content
          if (savedContent) {
            // If it's a Promise, handle it
            if (savedContent && typeof savedContent.then === 'function') {
              savedContent.then((content: any) => {
                // Call attempts API to save the question
                saveDrawingToAttempts(content)
              }).catch((error: any) => {
                console.error('Error saving drawing:', error)
              })
            } else {
              // Call attempts API to save the question
              saveDrawingToAttempts(savedContent)
            }
          }
        } catch (error) {
          console.error('Error calling save:', error)
        }
      }
      changeCountRef.current = 0 // Reset counter
    }
  }, [zwibblerCtx, zwibblerInstance])

  // Function to save drawing content to attempts API
  const saveDrawingToAttempts = useCallback(async (drawingContent: string) => {
    try {
      if (saveFunction && questionId) {
        // Use the passed saveFunction with the actual question ID
        await saveFunction(questionId, 1, { lq_answer: drawingContent })
      }
    } catch (error) {
      console.error('Error saving drawing to attempts API:', error)
    }
  }, [saveFunction, questionId])

  // Store the callback in a ref to prevent multiple listeners
  useEffect(() => {
    onDocumentChangedRef.current = onDocumentChanged
  }, [onDocumentChanged])

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
      stableCtxRef.current = ctx // Store a stable reference

      // Set up document change listener
      if (ctx && typeof ctx.on === 'function') {
        // Remove any existing listener first
        if (onDocumentChangedRef.current) {
          try {
            ctx.off('document-changed', onDocumentChangedRef.current)
          } catch (e) {
            // Ignore errors if off method doesn't exist
          }
        }
        
        // Add the new listener
        ctx.on('document-changed', onDocumentChanged)
        onDocumentChangedRef.current = onDocumentChanged
      }

      // Set up the canvas like in the HTML reference
      if (ctx) {
        // Set paper size to A4 portrait
        ctx.setPaperSize('A4', false)

        // Set up background like in the HTML reference
        ctx.useSinglelineBackground = () => {
          ctx.setConfig('background', 'image')
          ctx.setConfig('backgroundImage', 'https://app.myplp.io/chem/theme/assets/singleline_paper_2.jpg')
        }
        
        // Call the background function
        ctx.useSinglelineBackground()

        // Set page placement and zoom like in the HTML reference
        ctx.setConfig('pagePlacement', 'centre')
        ctx.setZoom('page')

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

        // Set initial brush tool with first color (black) and default thickness
        ctx.useBrushTool('#000', 4)
        
        // Ensure pen tool is active by default
        setCurrentTool('pen')
        setCurrentColor('#000000')
        
        // Add a small delay to ensure Zwibbler is fully initialized
        setTimeout(() => {
          // Explicitly activate the pen tool to ensure drawing mode
          if (typeof ctx.usePenTool === 'function') {
            ctx.usePenTool()
          } else if (typeof ctx.useBrushTool === 'function') {
            // If usePenTool doesn't exist, useBrushTool should put us in drawing mode
            ctx.useBrushTool('#000', 4)
          }
          
          // Try to disable pan mode if it exists
          if (typeof ctx.disablePan === 'function') {
            ctx.disablePan()
          }
          
          // Try to explicitly set drawing mode
          if (typeof ctx.setDrawingMode === 'function') {
            ctx.setDrawingMode(true)
          }
          
          // Force a redraw to ensure the tool is properly set
          if (typeof ctx.redraw === 'function') {
            ctx.redraw()
          }
        }, 100)
      }
    } catch (error) {
      console.error('Error initializing Zwibbler:', error)
    }
  }, [])

  // Tool functions
  const usePen = useCallback((width: number, color: string, type: number) => {
    
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
    }
  }, [zwibblerCtx])

  // Helper function to find tool methods
  const findToolMethods = useCallback(() => {
    if (zwibblerCtx) {
      const protoMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(zwibblerCtx))
    }
  }, [zwibblerCtx])

  const useHighlighter = useCallback(() => {
    setCurrentTool('highlighter')
    if (zwibblerCtx) {
      const color = window.Zwibbler.setColourOpacity(currentColor, 0.5)
      zwibblerCtx.useBrushTool(color, currentThickness)
    }
  }, [zwibblerCtx, currentColor, currentThickness])

  const useEraser = useCallback(() => {
    setCurrentTool('eraser')
    if (zwibblerCtx) {
      zwibblerCtx.useBrushTool({ lineWidth: currentThickness, strokeStyle: 'erase' })
    }
  }, [zwibblerCtx, currentThickness])

  const useLineTool = useCallback(() => {
    setCurrentTool('line')
    if (zwibblerCtx) {
      zwibblerCtx.useLineTool()
    }
  }, [zwibblerCtx])

  const usePickTool = useCallback(() => {
    setCurrentTool('pick')
    if (zwibblerCtx) {
      zwibblerCtx.usePickTool()
    }
  }, [zwibblerCtx])

  // Function to force redraw
  const forceRedraw = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.redraw === 'function') {
      zwibblerCtx.redraw()
    } else if (zwibblerCtx && typeof zwibblerCtx.refresh === 'function') {
      zwibblerCtx.refresh()
    } else if (zwibblerInstance && typeof zwibblerInstance.redraw === 'function') {
      zwibblerInstance.redraw()
    } else if (zwibblerInstance && typeof zwibblerInstance.refresh === 'function') {
      zwibblerInstance.refresh()
    }
  }, [zwibblerCtx, zwibblerInstance])

  // Function to clear background properly
  const clearBackgroundProperly = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.setConfig === 'function') {
      // Set background color to grey
      zwibblerCtx.setConfig('background', '#f0f0f0')
    } else if (zwibblerInstance && typeof zwibblerInstance.setConfig === 'function') {
      zwibblerInstance.setConfig('background', '#f0f0f0')
    } else if (zwibblerCtx && typeof zwibblerCtx.setPageBackground === 'function') {
      // Try to clear page background and let the default background show
      zwibblerCtx.setPageBackground(0, '')
    } else if (zwibblerInstance && typeof zwibblerInstance.setPageBackground === 'function') {
      zwibblerInstance.setPageBackground(0, '')
    }
  }, [zwibblerCtx, zwibblerInstance])

  // Function to restore paper background
  const restorePaperBackground = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.setPageBackground === 'function') {
      // Restore the paper background
      zwibblerCtx.setPageBackground(0, 'https://app.myplp.io/chem/theme/assets/singleline_paper_2.jpg')
    } else if (zwibblerInstance && typeof zwibblerInstance.setPageBackground === 'function') {
      zwibblerInstance.setPageBackground(0, 'https://app.myplp.io/chem/theme/assets/singleline_paper_2.jpg')
    }
  }, [zwibblerCtx, zwibblerInstance])

  const usePanTool = useCallback(() => {
    setCurrentTool('pan')
    if (zwibblerCtx) {
      zwibblerCtx.usePanTool()
    }
  }, [zwibblerCtx])

  const useTextTool = useCallback(() => {
    setCurrentTool('text')
    if (zwibblerCtx) {
      zwibblerCtx.useTextTool()
    }
  }, [zwibblerCtx])

  // Function to clear background
  const clearBackground = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.setConfig === 'function') {
      zwibblerCtx.setConfig('backgroundColor', '#f0f0f0')
    } else if (zwibblerInstance && typeof zwibblerInstance.setConfig === 'function') {
      zwibblerInstance.setConfig('backgroundColor', '#f0f0f0')
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
    if (zwibblerCtx && typeof zwibblerCtx.undo === 'function') {
      zwibblerCtx.undo()
    }
  }, [zwibblerCtx])

  const redo = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.redo === 'function') {
      zwibblerCtx.redo()
    }
  }, [zwibblerCtx])

  // Clear everything
  const clear = useCallback(() => {
    
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
    }
  }, [zwibblerCtx])

  // Paper size functions
  const setLandscape = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.setPaperSize === 'function') {
      zwibblerCtx.setPaperSize('A4', true) // true = landscape
    }
  }, [zwibblerCtx])

  const setPortrait = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.setPaperSize === 'function') {
      zwibblerCtx.setPaperSize('A4', false) // false = portrait
    }
  }, [zwibblerCtx])

  // Insert image
  const insertImage = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.insertImage === 'function') {
      zwibblerCtx.insertImage()
    }
  }, [zwibblerCtx])

  // Download/Export
  const download = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.download === 'function') {
      zwibblerCtx.download('pdf', filename)
    }
  }, [zwibblerCtx, filename])

  const save = useCallback(() => {
    if (zwibblerCtx && typeof zwibblerCtx.save === 'function') {
      zwibblerCtx.save('zwibbler3')
    }
  }, [zwibblerCtx])

  // Reset zoom
  const resetZoom = useCallback(() => {
    
    if (zwibblerCtx && typeof zwibblerCtx.setZoom === 'function') {
      zwibblerCtx.setZoom('page')
    }
  }, [zwibblerCtx])

  // Function to load Zwibbler3 JSON data into the drawing pad
  // Example usage:
  // const sampleData = '{"version":"3.0","pages":[{"id":"page1","width":800,"height":600,"nodes":[]}]}'
  // loadDrawingData(sampleData)
  const loadDrawingData = useCallback((jsonData: string) => {
    
    if (zwibblerCtx && typeof zwibblerCtx.load === 'function') {
      try {
        // Parse the JSON data if it's a string
        const dataToLoad = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData)
        
        // Load the data into Zwibbler
        const success = zwibblerCtx.load(dataToLoad)
        
        if (success) {
          // Trigger a redraw
          zwibblerCtx.redraw()
          
          // IMPORTANT: After loading data, ensure we're in pen mode
          // The loaded data might have saved a different tool state
          setTimeout(() => {
            // Re-activate pen tool after loading
            if (typeof zwibblerCtx.usePenTool === 'function') {
              zwibblerCtx.usePenTool()
            } else if (typeof zwibblerCtx.useBrushTool === 'function') {
              zwibblerCtx.useBrushTool(currentColor, currentThickness)
            }
            
            // Ensure our state is consistent
            setCurrentTool('pen')
          }, 50)
        } else {
          console.error('Failed to load drawing data')
        }
      } catch (error) {
        console.error('Error loading drawing data:', error)
      }
    }
  }, [zwibblerCtx, currentColor, currentThickness])

  // Function to load drawing data from a file
  const loadDrawingFromFile = useCallback((file: File) => {
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        loadDrawingData(content)
      }
    }
    reader.onerror = () => {
      console.error('Error reading file')
    }
    reader.readAsText(file)
  }, [loadDrawingData])

  // Load initial data if provided
  useEffect(() => {
    if (initialData && zwibblerCtx) {
      // Add a small delay to ensure Zwibbler is fully initialized
      const timer = setTimeout(() => {
        loadDrawingData(initialData)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [initialData, zwibblerCtx, loadDrawingData])

  return (
    <div className={`drawing-pad ${className}`}>
      <div className="drawing-pad-container">
        {/* Toolbar */}
        <div className="drawing-pad-toolbar">
          <div className="toolbar-section">
            {/* Pen tools */}
            <button 
              className={`tool-button ${currentTool === 'pen' ? 'active' : ''}`}
              onClick={() => usePen(currentThickness, currentColor, 1)}
              title="Pen"
            >
              <i className="fas fa-pencil-alt"></i>
            </button>
            <button 
              className={`tool-button ${currentTool === 'highlighter' ? 'active highlighter' : ''}`}
              onClick={() => usePen(currentThickness, currentColor, 2)}
              title="Highlighter"
            >
              <i className="fas fa-pen-to-square"></i>
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
              className={`tool-button ${currentTool === 'text' ? 'active' : ''}`}
              onClick={useTextTool}
              title="Text"
            >
              <i className="fas fa-font"></i>
            </button>
            <button 
              className="tool-button"
              onClick={insertImage}
              title="Insert image"
            >
              <i className="fas fa-image"></i>
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
              onClick={clear}
              title="Clear"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
            <button 
              className={`tool-button ${currentTool === 'pick' ? 'active' : ''}`}
              onClick={() => {
                if (zwibblerCtx && typeof zwibblerCtx.usePickTool === 'function') {
                  zwibblerCtx.usePickTool()
                  setCurrentTool('pick')
                }
              }}
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
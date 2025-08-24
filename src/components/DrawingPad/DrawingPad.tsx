import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { DrawingPadProps, DrawingPadRef } from './types'
import './DrawingPad.css'

// Add Zwibbler types
declare global {
  interface Window {
    Zwibbler: any
  }
}

const DrawingPad = forwardRef<DrawingPadRef, DrawingPadProps>(({
  width = 800,
  height = 600,
  questionId,
  saveFunction,
  className = '',
  backgroundImageUrl,
  initialDrawingData,
  title,
  description
}, ref) => {
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
  const isInitialized = useRef(false)

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

  // Helper function to convert Blob to base64
  const blobToBase64 = useCallback(async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Failed to convert blob to base64'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }, [])

  // Function to export drawing as PNG Blob for backend upload
  const exportDrawingAsPNGBlob = useCallback(async (): Promise<Blob | null> => {
    console.log('🚀 exportDrawingAsPNGBlob function called')
    
    // Use the stable context reference that's already available
    const ctx = stableCtxRef.current || zwibblerInstance?.ctx || zwibblerCtx
    
    if (!ctx) {
      console.log('❌ No Zwibbler context available from any source')
      console.log('Context sources:', {
        stableCtxRef: !!stableCtxRef.current,
        zwibblerInstance: !!zwibblerInstance,
        zwibblerInstanceCtx: !!zwibblerInstance?.ctx,
        zwibblerCtx: !!zwibblerCtx
      })
      return null
    }
    
    console.log('✅ Zwibbler context found from:', {
      source: stableCtxRef.current ? 'stableCtxRef' : 
              zwibblerInstance?.ctx ? 'zwibblerInstance.ctx' : 'zwibblerCtx'
    })
    
    try {
      console.log('🔄 Starting PNG export process...')
      
      // Force a redraw to ensure the canvas contains the latest drawing
      if (typeof ctx.redraw === 'function') {
        console.log('🔄 Forcing redraw before PNG export...')
        ctx.redraw()
      }
      
      // Wait a bit for the redraw to complete
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('Zwibbler context available:', {
        hasContext: !!ctx,
        hasEa: !!ctx.ea,
        hasView: !!ctx.ea?.view,
        hasDa: !!ctx.ea?.view?.da,
        hasTc: !!ctx.tc,
        contextKeys: Object.keys(ctx || {}),
        viewKeys: ctx.ea?.view ? Object.keys(ctx.ea.view) : []
      })
      
      // Method 1: Use the correct Zwibbler rendering method (like the print function does)
      try {
        console.log('🔍 Method 1: Using Zwibbler view rendering method...')
        
        // Get the view from the context
        if (ctx.ea?.view) {
          const view = ctx.ea.view
          console.log('✅ Zwibbler view found:', view)
          
          // Get the current page bounds
          const pageRect = ctx.Zh()
          console.log('✅ Page bounds:', pageRect)
          
          if (pageRect && pageRect.width > 0 && pageRect.height > 0) {
            // Create a temporary canvas with the page dimensions
            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = pageRect.width
            tempCanvas.height = pageRect.height
            const tempCtx = tempCanvas.getContext('2d')
            
            if (tempCtx) {
              console.log('✅ Temporary canvas created:', tempCanvas.width, 'x', tempCanvas.height)
              
              // Use the same method as the print function: 
              // 1. First render the background (including background images) using view.kf()
              // 2. Then render the drawing content using view.aa.la()
              
              // Render background (this includes background images, grid, etc.)
              view.kf(tempCtx, 1, pageRect.x, pageRect.y, pageRect.width, pageRect.height, 1, 0, 0)
              console.log('✅ Background rendered to temporary canvas')
              
              // Render drawing content
              view.aa.la(tempCtx)
              console.log('✅ Drawing content rendered to temporary canvas')
              
              // Convert to PNG
              const pngDataUri = tempCanvas.toDataURL('image/png')
              console.log('✅ PNG data URI created, length:', pngDataUri.length)
              
              // Convert data URI to Blob
              const response = await fetch(pngDataUri)
              const blob = await response.blob()
              console.log('✅ PNG Blob created from view rendering, size:', blob.size, 'bytes')
              return blob
            }
          } else {
            console.log('⚠️ Invalid page bounds:', pageRect)
          }
        } else {
          console.log('❌ Zwibbler view not available')
        }
      } catch (viewError) {
        console.log('❌ Method 1 failed:', viewError)
      }
      
      // Method 2: Try Zwibbler save method as fallback
      try {
        console.log('🔍 Method 2: Trying Zwibbler save method...')
        const pngData = ctx.save('png', {
          encoding: 'data-uri'
        })
        
        console.log('✅ Zwibbler save result:', pngData, 'Type:', typeof pngData)
        
        if (pngData && typeof pngData.then === 'function') {
          // If it's a Promise, wait for it
          const result = await pngData
          console.log('✅ Promise resolved with:', result, 'Type:', typeof result)
          
          // Convert data URI to Blob
          if (typeof result === 'string' && result.startsWith('data:image/png')) {
            const response = await fetch(result)
            const blob = await response.blob()
            console.log('✅ PNG Blob created from Zwibbler save, size:', blob.size, 'bytes')
            return blob
          }
        } else {
          // If it's already resolved
          console.log('✅ Direct result:', pngData, 'Type:', typeof pngData)
          
          // Convert data URI to Blob
          if (typeof pngData === 'string' && pngData.startsWith('data:image/png')) {
            const response = await fetch(pngData)
            const blob = await response.blob()
            console.log('✅ PNG Blob created from Zwibbler save (direct), size:', blob.size, 'bytes')
            return blob
          }
        }
      } catch (zwibblerError) {
        console.log('❌ Method 2 failed:', zwibblerError)
      }
      
      // Method 3: Try to get the main canvas from the DOM as last resort
      try {
        console.log('🔍 Method 3: Trying DOM canvas...')
        const domCanvas = canvasRef.current?.querySelector('canvas')
        if (domCanvas) {
          console.log('✅ DOM canvas found:', domCanvas, 'Dimensions:', domCanvas.width, 'x', domCanvas.height)
          
          // Check if the canvas has content
          const tempCtx = domCanvas.getContext('2d')
          if (tempCtx) {
            const imageData = tempCtx.getImageData(0, 0, domCanvas.width, domCanvas.height)
            const hasContent = imageData.data.some((pixel: number) => pixel !== 0)
            console.log('DOM canvas content check:', { hasContent, totalPixels: imageData.data.length / 4 })
            
            if (hasContent) {
              const pngDataUri = domCanvas.toDataURL('image/png')
              console.log('✅ DOM canvas toDataURL successful, length:', pngDataUri.length)
              
              // Convert data URI to Blob
              const response = await fetch(pngDataUri)
              const blob = await response.blob()
              console.log('✅ PNG Blob created from DOM canvas, size:', blob.size, 'bytes')
              return blob
            } else {
              console.log('⚠️ DOM canvas also appears to be blank')
            }
          }
        }
      } catch (domCanvasError) {
        console.log('❌ Method 3 failed:', domCanvasError)
      }
      
      console.log('❌ All PNG export methods failed')
      return null
      
    } catch (error) {
      console.error('Error exporting drawing as PNG Blob:', error)
      return null
    }
  }, [zwibblerCtx, zwibblerInstance, stableCtxRef, canvasRef])

  // Function to save drawing content to attempts API
  const saveDrawingToAttempts = useCallback(async (drawingContent: string) => {
    try {
      if (saveFunction && questionId) {
        console.log('🔄 Starting to save drawing with PNG export...')
        
        // Try to export drawing as PNG first
        let pngBlob = null
        let pngBase64 = null
        
        try {
          console.log('📸 Attempting PNG export...')
          pngBlob = await exportDrawingAsPNGBlob()
          if (pngBlob) {
            console.log('✅ PNG Blob created successfully, size:', pngBlob.size, 'bytes')
            pngBase64 = await blobToBase64(pngBlob)
            console.log('✅ PNG Base64 created successfully, length:', pngBase64.length)
          } else {
            console.warn('⚠️ PNG export returned null')
          }
        } catch (pngError) {
          console.warn('⚠️ Failed to export PNG, continuing with JSON data only:', pngError)
          // Continue without PNG data - don't let PNG export failure break the save
        }
        
        // Use the passed saveFunction with the actual question ID
        // Send both the Zwibbler3 JSON data and the PNG image data (if available)
        const answerData: any = { 
          lq_answer: drawingContent
        }
        
        // Only add PNG data if we successfully exported it
        if (pngBlob && pngBase64) {
          answerData.drawing_png_blob = pngBlob
          answerData.drawing_png_base64 = pngBase64
          console.log('📤 PNG data added to answer payload')
        } else {
          console.log('📤 No PNG data available, sending JSON only')
        }
        
        console.log('📤 Sending answer data to API:', {
          hasJson: !!answerData.lq_answer,
          hasPngBlob: !!answerData.drawing_png_blob,
          hasPngBase64: !!answerData.drawing_png_base64,
          jsonLength: answerData.lq_answer?.length || 0,
          pngSize: pngBlob?.size || 0
        })
        
        await saveFunction(questionId, 1, answerData)
        console.log('✅ Drawing saved successfully to API')
      }
    } catch (error) {
      console.error('❌ Error saving drawing to attempts API:', error)
    }
  }, [saveFunction, questionId, exportDrawingAsPNGBlob, blobToBase64])

  // Function to get PNG data as a File object for FormData uploads
  const getPNGAsFile = useCallback(async (filename?: string): Promise<File | null> => {
    const pngBlob = await exportDrawingAsPNGBlob()
    if (pngBlob) {
      const defaultFilename = `drawing_${questionId || 'export'}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
      return new File([pngBlob], filename || defaultFilename, { type: 'image/png' })
    }
    return null
  }, [exportDrawingAsPNGBlob, questionId])

  // Function to export drawing as PNG (for download)
  const exportDrawingAsPNG = useCallback(async (): Promise<string | null> => {
    if (!zwibblerCtx) return null
    
    try {
      // Use Zwibbler's save method to export as PNG
      const pngData = zwibblerCtx.save('png', {
        encoding: 'data-uri' // Get as data URI (base64 encoded)
      })
      
      if (pngData && typeof pngData.then === 'function') {
        // If it's a Promise, wait for it
        return await pngData
      } else {
        // If it's already resolved
        return pngData
      }
    } catch (error) {
      console.error('Error exporting drawing as PNG:', error)
      return null
    }
  }, [zwibblerCtx])

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
          
          if (backgroundImageUrl) {
            // Use custom background image if provided
            
            ctx.setConfig('background', 'image')
            ctx.setConfig('backgroundImage', backgroundImageUrl)
          } else {
            // Use default singleline paper background
            ctx.setConfig('background', 'image')
            ctx.setConfig('backgroundImage', 'https://app.myplp.io/chem/theme/assets/singleline_paper_2.jpg')
          }
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

  // Load initial drawing data if provided
  useEffect(() => {
    if (initialDrawingData && zwibblerCtx && !isInitialized.current) {
      try {
        console.log('Loading initial drawing data:', initialDrawingData.substring(0, 100) + '...')
        
        // Handle different data formats
        let drawingData
        if (typeof initialDrawingData === 'string') {
          try {
            drawingData = JSON.parse(initialDrawingData)
          } catch (parseError) {
            console.log('Data is not valid JSON, treating as raw string')
            drawingData = initialDrawingData
          }
        } else {
          drawingData = initialDrawingData
        }
        
        // Load the drawing data into Zwibbler
        if (drawingData && zwibblerCtx.load) {
          zwibblerCtx.load(drawingData)
          console.log('✅ Initial drawing data loaded successfully')
          isInitialized.current = true
        }
      } catch (error) {
        console.error('❌ Error loading initial drawing data:', error)
      }
    }
  }, [initialDrawingData, zwibblerCtx])

  // Set background image when component mounts or backgroundImageUrl changes
  useEffect(() => {
    if (zwibblerCtx && typeof zwibblerCtx.setConfig === 'function') {
      if (backgroundImageUrl) {
        zwibblerCtx.setConfig('background', 'image')
        zwibblerCtx.setConfig('backgroundImage', backgroundImageUrl)
      } else {
        zwibblerCtx.setConfig('background', 'image')
        zwibblerCtx.setConfig('backgroundImage', 'https://app.myplp.io/chem/theme/assets/singleline_paper_2.jpg')
      }
    }
  }, [zwibblerCtx, backgroundImageUrl])

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
      zwibblerCtx.download('pdf', 'Drawing.pdf') // Changed filename to Drawing.pdf
    }
  }, [zwibblerCtx])

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
    console.log('jsonData', jsonData)
    if (zwibblerCtx && typeof zwibblerCtx.load === 'function') {
      try {
        // Parse the JSON data if it's a string
        const dataToLoad = typeof jsonData === 'string' ? jsonData : JSON.stringify(jsonData)
        console.log('dataToLoad', dataToLoad)
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

  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    getZwibblerContext: () => stableCtxRef.current || zwibblerInstance?.ctx || zwibblerCtx,
    getDrawingData: () => {
      const ctx = stableCtxRef.current || zwibblerInstance?.ctx || zwibblerCtx
      if (ctx && typeof ctx.save === 'function') {
        return ctx.save('zwibbler3')
      }
      return null
    },
    clearDrawing: () => {
      const ctx = stableCtxRef.current || zwibblerInstance?.ctx || zwibblerCtx
      if (ctx && typeof ctx.newDocument === 'function') {
        ctx.newDocument()
      }
    }
  }), [zwibblerCtx, zwibblerInstance, stableCtxRef])

  return (
    <div className={`drawing-pad ${className}`}>
      {/* Title and Description */}
      {(title || description) && (
        <div className="drawing-pad-header mb-3 p-3 bg-light rounded">
          {title && <h6 className="fw-bold text-dark mb-1">{title}</h6>}
          {description && <small className="text-muted">{description}</small>}
        </div>
      )}
      
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
            <button 
              className="tool-button"
              onClick={async () => {
                const pngData = await exportDrawingAsPNG()
                if (pngData) {
                  // Create a download link for the PNG
                  const link = document.createElement('a')
                  link.href = pngData
                  link.download = `drawing_${questionId || 'export'}.png`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }
              }}
              title="Export as PNG"
            >
              <i className="fas fa-image"></i>
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
})

export default DrawingPad
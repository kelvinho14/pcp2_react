import {FC, useState, useEffect} from 'react'
import {PageTitle} from '../../../_metronic/layout/core'
import TinyMCEEditor from '../../../components/Editor/TinyMCEEditor'
import {DrawingPad} from '../../../components/DrawingPad'
import './TestPage.css'

const TestPage: FC = () => {
  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth < 768 ? 600 : 800,
    height: window.innerWidth < 768 ? 400 : 600
  })

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth < 768 ? 600 : 800,
        height: window.innerWidth < 768 ? 400 : 600
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <PageTitle breadcrumbs={[]}>Test Page</PageTitle>
      
      {/* TinyMCE Editor Section */}
      <div className='card mb-8'>
        <div className='card-header'>
          <h3 className='card-title'>TinyMCE Editor</h3>
        </div>
        <div className='card-body'>
          <TinyMCEEditor
            initialValue='<p>This is a test page with TinyMCE editor</p>'
            onChange={(content) => {
              console.log('Editor content:', content)
            }}
            height={400}
            placeholder='Start writing your content...'
          />
        </div>
      </div>

      {/* DrawingPad Component Section */}
      <div className='card'>
        <div className='card-header'>
          <h3 className='card-title'>DrawingPad Component</h3>
          <div className='card-toolbar'>
            <span className='badge badge-light-primary fs-7'>React Component</span>
          </div>
        </div>
        <div className='card-body'>
          <div className='alert alert-info mb-6'>
            <div className='d-flex align-items-center'>
              <i className='fas fa-info-circle fs-2 me-3'></i>
              <div>
                <h6 className='alert-heading mb-1'>Interactive Drawing Tool</h6>
                <p className='mb-0'>
                  Use the toolbar to draw, erase, and create artwork. Features include multiple drawing tools, 
                  color palette, line width selection, and export functionality (PDF, PNG, JPG).
                </p>
              </div>
            </div>
          </div>
          <DrawingPad
            id="testDrawingPad"
            width={canvasSize.width}
            height={canvasSize.height}
            showToolbar={true}
            showPropertyPanel={false}
            showColourPanel={true}
            defaultBrushWidth={3}
            background="#ffffff"
            snap={20}
            pageView={true}
            onExport={(format: 'pdf' | 'png' | 'jpg') => {
              console.log(`Exporting drawing as ${format}`)
            }}
            onSave={(data: string) => {
              console.log('Saving drawing data:', data)
            }}
            className="test-drawing-pad"
          />
        </div>
      </div>
    </>
  )
}

export default TestPage 
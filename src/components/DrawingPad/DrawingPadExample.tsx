import React, { useState } from 'react'
import DrawingPad from './DrawingPad'
import './DrawingPadExample.css'

const DrawingPadExample: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'jpg'>('pdf')
  const [lastAction, setLastAction] = useState<string>('')

  const handleExport = (format: 'pdf' | 'png' | 'jpg') => {
    setLastAction(`Exported as ${format.toUpperCase()}`)
    console.log(`Exporting drawing as ${format}`)
  }

  const handleSave = (data: string) => {
    setLastAction('Drawing saved')
    console.log('Saving drawing data:', data)
  }

  return (
    <div className="drawing-pad-example">
      <div className="example-header">
        <h2>Drawing Pad Example</h2>
        <p>Use the toolbar to draw, erase, and export your artwork</p>
        {lastAction && (
          <div className="last-action">
            Last action: {lastAction}
          </div>
        )}
      </div>

      <div className="example-controls">
        <label>
          Export Format:
          <select 
            value={exportFormat} 
            onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'png' | 'jpg')}
          >
            <option value="pdf">PDF</option>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
        </label>
      </div>

      <div className="drawing-pad-container">
        <DrawingPad
          id="exampleDrawingPad"
          width={800}
          height={600}
          showToolbar={true}
          showPropertyPanel={false}
          showColourPanel={true}
          defaultBrushWidth={3}
          background="#ffffff"
          snap={20}
          pageView={true}
          onExport={handleExport}
          onSave={handleSave}
          className="example-drawing-pad"
        />
      </div>

      <div className="example-footer">
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>🎨 Multiple drawing tools (pen, brush, eraser, line)</li>
          <li>🎨 Color palette with opacity control</li>
          <li>📏 Adjustable line width</li>
          <li>📷 Image insertion capability</li>
          <li>💾 Export to PDF, PNG, or JPG</li>
          <li>↩️ Undo/Redo functionality</li>
          <li>🧹 Clear canvas</li>
          <li>📱 Responsive design</li>
        </ul>
      </div>
    </div>
  )
}

export default DrawingPadExample 
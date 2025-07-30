import React from 'react'
import { LineWidthSelectorProps } from './types'
import './LineWidthSelector.css'

const LineWidthSelector: React.FC<LineWidthSelectorProps> = ({
  onWidthChange,
  currentWidth = 4,
  className = ''
}) => {
  const widths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  return (
    <div className={`line-width-selector ${className}`}>
      <div className="selector-header">
        <h4>Line Width</h4>
      </div>
      
      <div className="width-options">
        {widths.map((width) => (
          <button
            key={width}
            className={`width-option ${currentWidth === width ? 'selected' : ''}`}
            onClick={() => onWidthChange?.(width)}
            title={`Width: ${width}px`}
          >
            <div 
              className="width-preview"
              style={{ 
                height: `${width}px`,
                backgroundColor: '#000'
              }}
            />
            <span>{width}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default LineWidthSelector 
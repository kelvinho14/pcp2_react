import React from 'react'
import { ColourPaletteProps } from './types'
import './ColourPalette.css'

const ColourPalette: React.FC<ColourPaletteProps> = ({
  onColourSelect,
  onOpacityChange,
  currentColour = '#000000',
  currentOpacity = 1,
  className = ''
}) => {
  const colours = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
    '#00ff88', '#ff0088', '#880000', '#008800', '#000088',
    '#888800', '#880088', '#008888', '#ff4400', '#4400ff',
    '#00ff44', '#ff0044', '#440000', '#004400', '#000044',
    '#444400', '#440044', '#004444'
  ]

  return (
    <div className={`colour-palette ${className}`}>
      <div className="palette-header">
        <h4>Colour Palette</h4>
      </div>
      
      <div className="palette-colours">
        {colours.map((colour, index) => (
          <button
            key={index}
            className={`colour-swatch ${currentColour === colour ? 'selected' : ''}`}
            style={{ backgroundColor: colour }}
            onClick={() => onColourSelect?.(colour)}
            title={colour}
          />
        ))}
      </div>

      <div className="opacity-control">
        <label htmlFor="opacity-slider">Opacity:</label>
        <input
          id="opacity-slider"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={currentOpacity}
          onChange={(e) => onOpacityChange?.(parseFloat(e.target.value))}
        />
        <span>{Math.round(currentOpacity * 100)}%</span>
      </div>
    </div>
  )
}

export default ColourPalette 
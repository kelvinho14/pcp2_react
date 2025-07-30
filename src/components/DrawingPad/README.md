# DrawingPad Component

A React-based drawing pad component with a comprehensive toolbar and drawing tools.

## Features

- 🎨 Multiple drawing tools (pen, brush, eraser, line, pick, pan)
- 🎨 Color palette with opacity control
- 📏 Line width selector
- 📄 Paper size controls (landscape/portrait)
- 📷 Image insertion
- 💾 Export functionality (PDF, PNG, JPG)
- ↩️ Undo/Redo functionality
- 🧹 Clear canvas
- 📱 Responsive design
- 🎯 Touch device support

## Usage

### Basic Usage

```tsx
import { DrawingPad } from '@/components/DrawingPad'

function App() {
  return (
    <DrawingPad
      width={800}
      height={600}
      showToolbar={true}
      defaultBrushWidth={4}
      background="white"
    />
  )
}
```

### Advanced Usage

```tsx
import { DrawingPad } from '@/components/DrawingPad'

function App() {
  const handleExport = (format: 'pdf' | 'png' | 'jpg') => {
    console.log(`Exporting as ${format}`)
  }

  const handleSave = (data: string) => {
    console.log('Saving drawing data:', data)
  }

  return (
    <DrawingPad
      id="myDrawingPad"
      width={1024}
      height={768}
      showToolbar={true}
      showPropertyPanel={false}
      showColourPanel={true}
      defaultBrushWidth={2}
      background="#f0f0f0"
      snap={20}
      pageView={true}
      onExport={handleExport}
      onSave={handleSave}
      className="custom-drawing-pad"
    />
  )
}
```

## Props

### DrawingPadProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | `'drawingPad'` | Unique identifier for the drawing pad |
| `showToolbar` | `boolean` | `true` | Whether to show the toolbar |
| `defaultBrushWidth` | `number` | `4` | Default brush/pen width |
| `showPropertyPanel` | `boolean` | `false` | Whether to show property panel |
| `background` | `string` | `'white'` | Canvas background color |
| `snap` | `number` | `20` | Snap-to-grid value |
| `pageView` | `boolean` | `true` | Whether to show page view |
| `showColourPanel` | `boolean` | `false` | Whether to show color panel |
| `width` | `number` | `800` | Canvas width |
| `height` | `number` | `600` | Canvas height |
| `onSave` | `(data: string) => void` | `undefined` | Save callback |
| `onExport` | `(format: 'pdf' \| 'png' \| 'jpg') => void` | `undefined` | Export callback |
| `className` | `string` | `''` | Additional CSS classes |

## Tools

### Available Tools

1. **Pen Tool** - Freehand drawing with customizable width and color
2. **Brush Tool** - Soft brush strokes
3. **Line Tool** - Straight line drawing
4. **Eraser Tool** - Erase with different sizes
5. **Pick Tool** - Select and move objects
6. **Pan Tool** - Pan and zoom the canvas

### Toolbar Features

- **Undo/Redo** - History management
- **Clear** - Clear the entire canvas
- **Insert Image** - Add images to the canvas
- **Paper Size** - Switch between landscape and portrait
- **Export** - Download as PDF, PNG, or JPG
- **Zoom Reset** - Reset zoom level

## Styling

The component uses CSS modules and can be customized with:

```css
/* Custom styles */
.custom-drawing-pad {
  border: 2px solid #007bff;
  border-radius: 12px;
}

.custom-drawing-pad .drawing-pad-toolbar {
  background: #f8f9fa;
}

.custom-drawing-pad .toolbar-button.active {
  background: #28a745;
  border-color: #28a745;
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- React 16.8+
- TypeScript 4.0+
- Font Awesome (for icons)

## License

MIT License 
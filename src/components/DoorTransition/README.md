# Door Transition Component

A beautiful **Traditional Japanese Shoji Screen Door** animation for page navigation using Framer Motion.

## Features

- 🚪 **Authentic Shoji door animation** with 3D perspective transforms
- 🎨 Light wooden grid frames with translucent paper panels
- ⚡ Built with Framer Motion for smooth performance
- 🎯 Customizable duration and colors
- 📱 Responsive and works on all screen sizes
- 🔧 Easy to integrate with React Router

## Components

### `DoorTransition`
The core component that renders the sliding door panels.

**Props:**
- `isOpen` (boolean): Controls whether the door animation is active
- `children` (ReactNode, optional): Content to display on the door panels
- `onComplete` (function, optional): Callback when animation completes
- `duration` (number, optional): Animation duration in seconds (default: 0.8)
- `doorColor` (string, optional): Color of the door panels (default: '#1e1e2d')

### `PageTransitionWrapper`
A wrapper component that automatically triggers the door transition on route changes.

**Props:**
- `children` (ReactNode): The content to wrap (usually `<Outlet />`)
- `enableTransition` (boolean, optional): Enable/disable transitions (default: true)
- `transitionDuration` (number, optional): Animation duration in seconds (default: 0.8)
- `doorColor` (string, optional): Color of the door panels

## Usage

### Already Integrated!

The door transition is already integrated into the MasterLayout and will work automatically when you navigate between pages.

### Customizing the Transition

You can customize the transition by modifying the props in `MasterLayout.tsx`:

```tsx
<PageTransitionWrapper 
  enableTransition={true} 
  transitionDuration={0.6}
  doorColor="#1e1e2d"
>
  <Outlet />
</PageTransitionWrapper>
```

### Disabling the Transition

To disable the transition temporarily:

```tsx
<PageTransitionWrapper enableTransition={false}>
  <Outlet />
</PageTransitionWrapper>
```

### Using DoorTransition Standalone

You can also use the `DoorTransition` component independently:

```tsx
import { useState } from 'react'
import { DoorTransition } from './components/DoorTransition'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  const handleNavigate = () => {
    setIsOpen(true)
    setTimeout(() => {
      // Your navigation logic here
      setIsOpen(false)
    }, 800)
  }

  return (
    <>
      <button onClick={handleNavigate}>Navigate</button>
      <DoorTransition 
        isOpen={isOpen} 
        duration={0.8}
        doorColor="#1e1e2d"
      >
        <span>Loading...</span>
      </DoorTransition>
    </>
  )
}
```

## Configuration Examples

### Fast Transition
```tsx
<PageTransitionWrapper transitionDuration={0.3}>
  <Outlet />
</PageTransitionWrapper>
```

### Slow, Dramatic Transition
```tsx
<PageTransitionWrapper transitionDuration={1.2}>
  <Outlet />
</PageTransitionWrapper>
```

### Custom Color
```tsx
<PageTransitionWrapper doorColor="#3498db">
  <Outlet />
</PageTransitionWrapper>
```

### With Loading Text
```tsx
<DoorTransition isOpen={isOpen}>
  <span>Loading...</span>
</DoorTransition>
```

## How It Works

1. When a route change is detected by `useLocation()`, the transition starts
2. Two authentic Shoji screen doors **slide closed** from both sides (left panel slides left, right panel slides right)
3. While the doors are closed, the new page content is loaded
4. The Shoji doors **slide open** to both sides, revealing the new page

The effect uses horizontal sliding animations to create a traditional Japanese Shoji screen door animation. Each door includes:
- Light wooden grid frames with horizontal and vertical lines
- Translucent paper panels (washi-style) with subtle texture
- Traditional circular wooden pull handles
- Soft shadows and lighting effects
- Authentic cream and light brown color scheme
- Smooth horizontal sliding motion like real shoji screens

## Dependencies

- `framer-motion`: For smooth, performant animations
- `react-router-dom`: For route detection and navigation

## Performance

The component uses:
- `AnimatePresence` for smooth mount/unmount animations
- Fixed positioning with `transform` for GPU acceleration
- Optimized easing curves for natural motion
- High z-index (9999) to ensure it appears above all content

## Browser Support

Works on all modern browsers that support:
- CSS transforms
- React 18+
- ES6+


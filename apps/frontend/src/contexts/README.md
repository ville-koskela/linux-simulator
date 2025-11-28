# Window Context

A comprehensive React context for managing multiple floating windows in your application.

## Features

- **Create/Close Windows**: Dynamically create and close windows
- **Window Z-Index Management**: Automatically manages z-index for proper window layering
- **Bring to Front**: Click any window to bring it to the front
- **Minimize/Restore**: Minimize windows to taskbar and restore them
- **Window Tracking**: Keep track of all open windows
- **Prevent Duplicates**: Automatically prevents creating duplicate windows with the same ID

## Installation

The window context is already set up in your project. It consists of:

- `src/contexts/WindowContext.tsx` - The main context provider and hook
- `src/components/WindowManager/` - Component that renders all windows
- `src/components/WindowTaskbar/` - Optional taskbar for managing windows

## Usage

### 1. Wrap your app with WindowProvider

This is already done in `src/main.tsx`:

```tsx
import { WindowProvider } from './contexts';

<WindowProvider>
  <App />
</WindowProvider>
```

### 2. Use the useWindows hook

```tsx
import { useWindows } from './contexts';

function MyComponent() {
  const { createWindow, closeWindow, windows } = useWindows();
  
  const handleOpenWindow = () => {
    createWindow({
      id: 'my-window-1',
      title: 'My Window',
      initialX: 100,
      initialY: 100,
      initialWidth: 400,
      initialHeight: 300,
      content: (
        <div>
          <h2>Window Content</h2>
          <p>Any React content can go here!</p>
        </div>
      ),
    });
  };
  
  return (
    <button onClick={handleOpenWindow}>
      Open Window
    </button>
  );
}
```

### 3. Add WindowManager to your app

The `WindowManager` component should be added once in your main App component:

```tsx
import { WindowManager } from './components/WindowManager';

function App() {
  return (
    <div>
      {/* Your app content */}
      <WindowManager />
    </div>
  );
}
```

### 4. Optional: Add WindowTaskbar

For a taskbar that shows all open windows:

```tsx
import { WindowTaskbar } from './components/WindowTaskbar';

function App() {
  return (
    <div>
      {/* Your app content */}
      <WindowManager />
      <WindowTaskbar />
    </div>
  );
}
```

## API Reference

### useWindows Hook

Returns an object with the following properties and methods:

#### Properties

- `windows: WindowState[]` - Array of all currently open windows

#### Methods

- `createWindow(config: WindowConfig): void` - Create a new window
- `closeWindow(id: string): void` - Close a window by ID
- `bringToFront(id: string): void` - Bring a window to the front
- `minimizeWindow(id: string): void` - Minimize a window
- `restoreWindow(id: string): void` - Restore a minimized window
- `getNextZIndex(): number` - Get the next available z-index

### WindowConfig Interface

```typescript
interface WindowConfig {
  id: string;                    // Unique identifier for the window
  title: string;                 // Window title shown in header
  content: ReactNode;            // Window content (any React element)
  initialX?: number;             // Initial X position (default: 100)
  initialY?: number;             // Initial Y position (default: 100)
  initialWidth?: number;         // Initial width (default: 400)
  initialHeight?: number;        // Initial height (default: 300)
  minWidth?: number;             // Minimum width (default: 200)
  minHeight?: number;            // Minimum height (default: 150)
  className?: string;            // Additional CSS class
  style?: CSSProperties;         // Additional inline styles
}
```

### WindowState Interface

Extends `WindowConfig` with additional runtime state:

```typescript
interface WindowState extends WindowConfig {
  zIndex: number;                // Current z-index
  isMinimized?: boolean;         // Whether window is minimized
}
```

## Examples

### Creating a Simple Window

```tsx
createWindow({
  id: 'settings',
  title: 'Settings',
  content: <SettingsForm />,
});
```

### Creating a Window with Custom Size and Position

```tsx
createWindow({
  id: 'editor',
  title: 'Code Editor',
  initialX: 200,
  initialY: 150,
  initialWidth: 800,
  initialHeight: 600,
  minWidth: 400,
  minHeight: 300,
  content: <CodeEditor />,
});
```

### Creating a Window from Within Another Window

```tsx
const MyWindowContent = () => {
  const { createWindow } = useWindows();
  
  return (
    <div>
      <h2>Parent Window</h2>
      <button
        onClick={() =>
          createWindow({
            id: `child-${Date.now()}`,
            title: 'Child Window',
            content: <div>Child window content</div>,
          })
        }
      >
        Open Child Window
      </button>
    </div>
  );
};
```

### Listing All Open Windows

```tsx
const WindowList = () => {
  const { windows, closeWindow } = useWindows();
  
  return (
    <ul>
      {windows.map((window) => (
        <li key={window.id}>
          {window.title}
          <button onClick={() => closeWindow(window.id)}>Close</button>
        </li>
      ))}
    </ul>
  );
};
```

## Notes

- Window IDs must be unique. If you try to create a window with an existing ID, it will just bring the existing window to front instead.
- Windows are automatically layered based on when they were created or last brought to front.
- The z-index starts at 1000 and increments for each new window or focus change.
- Minimized windows don't render (display: none) but remain in the windows array.
- The WindowManager handles click-to-focus automatically.

## Styling

You can customize window appearance by:

1. Passing `className` and `style` props to window config
2. Modifying `FloatingWindow.css` for global window styles
3. Modifying `WindowTaskbar.css` for taskbar styles

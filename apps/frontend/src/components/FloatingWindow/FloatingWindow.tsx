import type { CSSProperties, FC, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../contexts';
import './FloatingWindow.css';

interface FloatingWindowProps {
  children: ReactNode;
  title?: string;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  onClose?: () => void;
  onMinimize?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const FloatingWindow: FC<FloatingWindowProps> = ({
  children,
  title,
  initialX = 100,
  initialY = 100,
  initialWidth = 400,
  initialHeight = 300,
  minWidth = 200,
  minHeight = 150,
  onClose,
  onMinimize,
  className = '',
  style = {},
}) => {
  const { t } = useTranslations();
  const tWindow = t.floatingWindow;
  const windowTitle = title || tWindow.defaultTitle;

  const windowRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Handle dragging
  const handleMouseDownDrag = useCallback(
    (e: React.MouseEvent) => {
      if (
        (e.target as HTMLElement).closest('.floating-window-header') &&
        !(e.target as HTMLElement).closest('.floating-window-close') &&
        !(e.target as HTMLElement).closest('.floating-window-minimize')
      ) {
        setIsDragging(true);
        dragStart.current = {
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        };
        e.preventDefault();
      }
    },
    [position]
  ); // Handle resizing
  const handleMouseDownResize = useCallback(
    (e: React.MouseEvent, direction: string) => {
      setIsResizing(true);
      setResizeDirection(direction);
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        width: size.width,
        height: size.height,
      };
      e.preventDefault();
      e.stopPropagation();
    },
    [size]
  );

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;

        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;
        let newX = position.x;
        let newY = position.y;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(minWidth, resizeStart.current.width + deltaX);
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(minHeight, resizeStart.current.height + deltaY);
        }
        if (resizeDirection.includes('w')) {
          const potentialWidth = resizeStart.current.width - deltaX;
          if (potentialWidth >= minWidth) {
            newWidth = potentialWidth;
            newX = position.x + deltaX;
          }
        }
        if (resizeDirection.includes('n')) {
          const potentialHeight = resizeStart.current.height - deltaY;
          if (potentialHeight >= minHeight) {
            newHeight = potentialHeight;
            newY = position.y + deltaY;
          }
        }

        setSize({ width: newWidth, height: newHeight });
        if (resizeDirection.includes('w') || resizeDirection.includes('n')) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection('');
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, resizeDirection, position, minWidth, minHeight]);

  return (
    <div
      ref={windowRef}
      className={`floating-window ${className}`}
      style={{
        ...style,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: Drag handle needs to be a div for proper cursor styling */}
      <div
        className="floating-window-header"
        onMouseDown={handleMouseDownDrag}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
          }
        }}
      >
        <span className="floating-window-title">{windowTitle}</span>
        <div className="floating-window-controls">
          {onMinimize && (
            <button
              type="button"
              className="floating-window-minimize"
              onClick={onMinimize}
              aria-label={tWindow.aria.minimize}
            >
              −
            </button>
          )}
          {onClose && (
            <button
              type="button"
              className="floating-window-close"
              onClick={onClose}
              aria-label={tWindow.aria.close}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="floating-window-content">{children}</div>

      {/* Resize handles - bottom, right, and bottom-right corner only */}
      {/* biome-ignore lint/a11y/useSemanticElements: Resize handles need to be divs for proper positioning and cursor styling */}
      <div
        className="resize-handle resize-s"
        onMouseDown={(e) => handleMouseDownResize(e, 's')}
        role="button"
        tabIndex={-1}
        aria-label={tWindow.aria.resizeBottom}
      />
      {/* biome-ignore lint/a11y/useSemanticElements: Resize handles need to be divs for proper positioning and cursor styling */}
      <div
        className="resize-handle resize-e"
        onMouseDown={(e) => handleMouseDownResize(e, 'e')}
        role="button"
        tabIndex={-1}
        aria-label={tWindow.aria.resizeRight}
      />
      {/* biome-ignore lint/a11y/useSemanticElements: Resize handles need to be divs for proper positioning and cursor styling */}
      <div
        className="resize-handle resize-se"
        onMouseDown={(e) => handleMouseDownResize(e, 'se')}
        role="button"
        tabIndex={-1}
        aria-label={tWindow.aria.resizeBottomRight}
      />
    </div>
  );
};

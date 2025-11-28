import type { FC } from 'react';
import { useWindows } from '../../contexts';
import { FloatingWindow } from '../FloatingWindow';

export const WindowManager: FC = () => {
  const { windows, closeWindow, bringToFront, minimizeWindow } = useWindows();

  return (
    <>
      {windows.map((window) => {
        if (window.isMinimized) {
          return null;
        }

        return (
          // biome-ignore lint/a11y/useSemanticElements: Window wrapper needs to be a div for proper positioning
          <div
            key={window.id}
            onMouseDown={() => bringToFront(window.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                bringToFront(window.id);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Window: ${window.title}`}
          >
            <FloatingWindow
              title={window.title}
              initialX={window.initialX}
              initialY={window.initialY}
              initialWidth={window.initialWidth}
              initialHeight={window.initialHeight}
              minWidth={window.minWidth}
              minHeight={window.minHeight}
              onClose={() => closeWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              className={window.className}
              style={{
                ...window.style,
                zIndex: window.zIndex,
              }}
            >
              {window.content}
            </FloatingWindow>
          </div>
        );
      })}
    </>
  );
};

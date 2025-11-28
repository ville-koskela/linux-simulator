import type { CSSProperties, ReactNode } from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

export interface WindowConfig {
  id: string;
  title: string;
  content: ReactNode;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  className?: string;
  style?: CSSProperties;
}

export interface WindowState extends WindowConfig {
  zIndex: number;
  isMinimized?: boolean;
}

interface WindowContextValue {
  windows: WindowState[];
  createWindow: (config: WindowConfig) => void;
  closeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  getNextZIndex: () => number;
}

const WindowContext = createContext<WindowContextValue | undefined>(undefined);

export const useWindows = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindows must be used within a WindowProvider');
  }
  return context;
};

interface WindowProviderProps {
  children: ReactNode;
}

export const WindowProvider = ({ children }: WindowProviderProps) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const baseZIndex = 1000;

  const getNextZIndex = useCallback(() => {
    const maxZ = windows.reduce(
      (max, win) => Math.max(max, win.zIndex),
      baseZIndex
    );
    return maxZ + 1;
  }, [windows]);

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) => {
      const window = prev.find((win) => win.id === id);
      if (!window) return prev;

      const maxZ = prev.reduce((max, win) => Math.max(max, win.zIndex), 1000);
      const newZIndex = maxZ + 1;
      return prev.map((win) =>
        win.id === id ? { ...win, zIndex: newZIndex } : win
      );
    });
  }, []);

  const createWindow = useCallback(
    (config: WindowConfig) => {
      // Check if window with this ID already exists
      setWindows((prev) => {
        const existingWindow = prev.find((win) => win.id === config.id);
        if (existingWindow) {
          // If it exists, just bring it to front
          bringToFront(config.id);
          return prev;
        }

        const maxZ = prev.reduce((max, win) => Math.max(max, win.zIndex), 1000);
        const newWindow: WindowState = {
          ...config,
          zIndex: maxZ + 1,
          isMinimized: false,
        };

        return [...prev, newWindow];
      });
    },
    [bringToFront]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((win) => win.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, isMinimized: true } : win))
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const maxZ = prev.reduce((max, win) => Math.max(max, win.zIndex), 1000);
      return prev.map((win) =>
        win.id === id ? { ...win, isMinimized: false, zIndex: maxZ + 1 } : win
      );
    });
  }, []);

  const value: WindowContextValue = {
    windows,
    createWindow,
    closeWindow,
    bringToFront,
    minimizeWindow,
    restoreWindow,
    getNextZIndex,
  };

  return (
    <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
  );
};

import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import {
  SettingsProvider,
  TranslationsProvider,
  WindowProvider,
} from '../../src/contexts';

/**
 * Renders a component wrapped in all necessary providers for testing
 */
export const renderWithProviders = (component: ReactElement) => {
  // Mock window.matchMedia which is used by SettingsContext
  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });
  }

  return render(
    <SettingsProvider>
      <TranslationsProvider>
        <WindowProvider>{component}</WindowProvider>
      </TranslationsProvider>
    </SettingsProvider>
  );
};

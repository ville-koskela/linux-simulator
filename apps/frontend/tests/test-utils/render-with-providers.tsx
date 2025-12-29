import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { SettingsProvider, TranslationsProvider, WindowProvider } from "../../src/contexts";
import { mockTranslations } from "./mock-translation";

/**
 * Renders a component wrapped in all necessary providers for testing
 */
export const renderWithProviders = (component: ReactElement): RenderResult => {
  // Mock window.matchMedia which is used by SettingsContext
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
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

  // Pre-populate sessionStorage with mock translations for both languages
  sessionStorage.setItem("translations-en", JSON.stringify(mockTranslations));
  sessionStorage.setItem("translations-fi", JSON.stringify(mockTranslations));

  return render(
    <SettingsProvider>
      <TranslationsProvider>
        <WindowProvider>{component}</WindowProvider>
      </TranslationsProvider>
    </SettingsProvider>
  );
};

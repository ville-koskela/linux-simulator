import type { Settings, ThemeColors } from "@linux-simulator/shared";
import { defaultThemes } from "@linux-simulator/shared";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks";
import { getBrowserLanguage } from "../utils/language";

interface SettingsContextValue {
  settings: Settings;
  updateLanguage: (language: string) => void;
  updateTheme: (theme: ThemeColors) => void;
  applyPresetTheme: (themeName: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "app-settings";

// Available languages - should match the languages in TranslationsContext
const AVAILABLE_LANGUAGES = ["en", "fi"];

const getDefaultSettings = (): Settings => {
  // Check system preference for dark mode
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Get browser language with fallback to English
  const browserLanguage = getBrowserLanguage(AVAILABLE_LANGUAGES, "en");

  return {
    language: browserLanguage,
    theme: prefersDark ? defaultThemes.dark : defaultThemes.light,
  };
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEY,
    getDefaultSettings()
  );

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", settings.theme.primary);
    root.style.setProperty("--color-secondary", settings.theme.secondary);
    root.style.setProperty("--color-background", settings.theme.background);
    root.style.setProperty("--color-surface", settings.theme.surface);
    root.style.setProperty("--color-text", settings.theme.text);
    root.style.setProperty(
      "--color-text-secondary",
      settings.theme.textSecondary
    );
    root.style.setProperty("--color-border", settings.theme.border);
    root.style.setProperty("--color-success", settings.theme.success);
    root.style.setProperty("--color-warning", settings.theme.warning);
    root.style.setProperty("--color-error", settings.theme.error);
  }, [settings.theme]);

  const updateLanguage = (language: string) => {
    setSettings((prev: Settings) => ({ ...prev, language }));
  };

  const updateTheme = (theme: ThemeColors) => {
    setSettings((prev: Settings) => ({ ...prev, theme }));
  };

  const applyPresetTheme = (themeName: string) => {
    const theme = defaultThemes[themeName];
    if (theme) {
      updateTheme(theme);
    }
  };

  const value: SettingsContextValue = {
    settings,
    updateLanguage,
    updateTheme,
    applyPresetTheme,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

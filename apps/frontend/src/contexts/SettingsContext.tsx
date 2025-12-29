import type { Settings, ThemeColors } from "@linux-simulator/shared";
import {
  defaultThemes,
  fallbackLanguage,
  languageCodeSchema,
  languageCodes,
} from "@linux-simulator/shared";
import type { JSX, ReactNode } from "react";
import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks";
import { getBrowserLanguage } from "../utils/language";

interface SettingsContextValue {
  settings: Settings;
  updateLanguage: (language: string) => void;
  updateTheme: (theme: ThemeColors) => void;
  applyPresetTheme: (themeName: string) => void;
}

const SettingsContext: React.Context<SettingsContextValue | undefined> = createContext<
  SettingsContextValue | undefined
>(undefined);

export const useSettings = (): SettingsContextValue => {
  const context: SettingsContextValue | undefined = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "app-settings";

const getDefaultSettings = (): Settings => {
  // Check system preference for dark mode
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Get browser language with fallback to English
  const browserLanguage = getBrowserLanguage(languageCodes);

  return {
    language: browserLanguage,
    theme: prefersDark ? defaultThemes.dark : defaultThemes.light,
  };
};

export const SettingsProvider = ({ children }: SettingsProviderProps): JSX.Element => {
  const [settings, setSettings] = useLocalStorage<Settings>(STORAGE_KEY, getDefaultSettings());

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", settings.theme.primary);
    root.style.setProperty("--color-secondary", settings.theme.secondary);
    root.style.setProperty("--color-background", settings.theme.background);
    root.style.setProperty("--color-surface", settings.theme.surface);
    root.style.setProperty("--color-text", settings.theme.text);
    root.style.setProperty("--color-text-secondary", settings.theme.textSecondary);
    root.style.setProperty("--color-border", settings.theme.border);
    root.style.setProperty("--color-success", settings.theme.success);
    root.style.setProperty("--color-warning", settings.theme.warning);
    root.style.setProperty("--color-error", settings.theme.error);
  }, [settings.theme]);

  const updateLanguage = (lang: string): void => {
    const languageResult = languageCodeSchema.safeParse(lang);
    const language = languageResult.success ? languageResult.data : fallbackLanguage;

    setSettings((prev: Settings) => ({ ...prev, language }));
  };

  const updateTheme = (theme: ThemeColors): void => {
    setSettings((prev: Settings) => ({ ...prev, theme }));
  };

  const applyPresetTheme = (themeName: string): void => {
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

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

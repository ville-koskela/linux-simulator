import { z } from "zod";

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

// Language codes - single source of truth
export const languageCodes = ["en", "fi"] as const;
export const languageCodeSchema: z.ZodEnum<["en", "fi"]> = z.enum(languageCodes);
export type LanguageCode = z.infer<typeof languageCodeSchema>;
export const fallbackLanguage: LanguageCode = "en";

// Helper type to enforce all language codes have a name
type LanguageMetadata = {
  readonly [K in LanguageCode]: { code: K; name: string };
};

// Enforce that all language codes are present
const languageMetadata: LanguageMetadata = {
  en: { code: "en", name: "English" },
  fi: { code: "fi", name: "Suomi" },
} as const;

// Export as array for easier iteration in UI
export const availableLanguages: ReadonlyArray<{ code: LanguageCode; name: string }> =
  Object.values(languageMetadata);

export interface Settings {
  language: LanguageCode;
  theme: ThemeColors;
}

export const defaultThemes: Record<string, ThemeColors> = {
  light: {
    primary: "#646cff",
    secondary: "#535bf2",
    background: "#ffffff",
    surface: "#f9f9f9",
    text: "#213547",
    textSecondary: "#666666",
    border: "#cccccc",
    success: "#27ae60",
    warning: "#f39c12",
    error: "#e74c3c",
  },
  dark: {
    primary: "#646cff",
    secondary: "#535bf2",
    background: "#242424",
    surface: "#1a1a1a",
    text: "rgba(255, 255, 255, 0.87)",
    textSecondary: "#888888",
    border: "#444444",
    success: "#2ecc71",
    warning: "#f39c12",
    error: "#e74c3c",
  },
  ocean: {
    primary: "#16a085",
    secondary: "#1abc9c",
    background: "#ecf0f1",
    surface: "#ffffff",
    text: "#2c3e50",
    textSecondary: "#7f8c8d",
    border: "#bdc3c7",
    success: "#27ae60",
    warning: "#f39c12",
    error: "#e74c3c",
  },
  sunset: {
    primary: "#e67e22",
    secondary: "#d35400",
    background: "#fdf6e3",
    surface: "#ffffff",
    text: "#34495e",
    textSecondary: "#7f8c8d",
    border: "#d6d6d6",
    success: "#27ae60",
    warning: "#f39c12",
    error: "#c0392b",
  },
  forest: {
    primary: "#27ae60",
    secondary: "#2ecc71",
    background: "#2c3e50",
    surface: "#34495e",
    text: "#ecf0f1",
    textSecondary: "#95a5a6",
    border: "#4a5f7f",
    success: "#2ecc71",
    warning: "#f39c12",
    error: "#e74c3c",
  },
};

import { z } from "zod";

/**
 * Translation schema - defines the structure of all translation files
 * This ensures type safety across frontend and backend
 */

// biome-ignore lint/nursery/useExplicitType: Re-defining the schema here would be way too verbose
export const translationSchema = z.object({
  settings: z.object({
    title: z.string(),
    languageSettings: z.object({
      title: z.string(),
      label: z.string(),
      description: z.string(),
    }),
    themePresets: z.object({
      title: z.string(),
      light: z.string(),
      dark: z.string(),
      ocean: z.string(),
      forest: z.string(),
      sunset: z.string(),
    }),
    customTheme: z.object({
      title: z.string(),
      colors: z.object({
        primary: z.string(),
        secondary: z.string(),
        background: z.string(),
        surface: z.string(),
        text: z.string(),
        textSecondary: z.string(),
        border: z.string(),
        success: z.string(),
        warning: z.string(),
        error: z.string(),
      }),
      tip: z.string(),
      actions: z.object({
        apply: z.string(),
        reset: z.string(),
      }),
      aria: z.object({
        pickColor: z.string(),
        colorPicker: z.string(),
      }),
    }),
  }),
  terminal: z.object({
    title: z.string(),
    welcome: z.object({
      version: z.string(),
      help: z.string(),
    }),
    prompt: z.string(),
    help: z.object({
      title: z.string(),
      helpCommand: z.string(),
      clearCommand: z.string(),
    }),
    errors: z.object({
      commandNotFound: z.string(),
      notImplemented: z.string(),
    }),
  }),
  taskbar: z.object({
    start: z.object({
      title: z.string(),
      text: z.string(),
      header: z.string(),
      closeMenu: z.string(),
    }),
    applications: z.object({
      terminal: z.string(),
      settings: z.string(),
    }),
    window: z.object({
      restore: z.string(),
      minimize: z.string(),
      close: z.string(),
    }),
    noWindows: z.string(),
  }),
  floatingWindow: z.object({
    defaultTitle: z.string(),
    aria: z.object({
      minimize: z.string(),
      close: z.string(),
      resizeBottom: z.string(),
      resizeRight: z.string(),
      resizeBottomRight: z.string(),
    }),
  }),
});

export type Translation = z.infer<typeof translationSchema>;

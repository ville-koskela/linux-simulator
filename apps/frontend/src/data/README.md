# Translation Files

This directory contains translation files for the application's user-facing text.

## Files

- `translations-en.json` - English translations (default)
- `translations-fi.json` - Finnish translations (Suomenkielinen käännös)
- `terminal-commands.json` - Terminal command definitions

## Structure

The translation files are organized by component/feature:

```json
{
  "settings": {
    "title": "Settings",
    "languageSettings": { ... },
    "themePresets": { ... },
    "customTheme": { ... }
  },
  "terminal": {
    "title": "Terminal",
    "welcome": { ... },
    "help": { ... },
    "errors": { ... }
  },
  "terminalCommands": {
    "echo": { ... },
    "date": { ... }
  },
  "taskbar": {
    "start": { ... },
    "applications": { ... },
    "window": { ... }
  },
  "floatingWindow": {
    "defaultTitle": "Window",
    "aria": { ... }
  }
}
```

## Usage

Currently, all components import and use the English translations:

```typescript
import translations from '../../data/translations-en.json';

// In component:
const t = translations.settings;
```

## Adding New Translations

1. Add the new text to `translations-en.json` in the appropriate section
2. Add the corresponding translation to `translations-fi.json`
3. Update the component to use the translation key

## Future Implementation

Language switching functionality will be implemented in a future update, which will:
- Dynamically load the appropriate translation file based on user settings
- Use the language setting from SettingsContext
- Provide a hook or context for accessing translations throughout the app

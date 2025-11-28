# Settings Component

A comprehensive settings panel that allows users to customize the application's language and theme colors.

## Features

### Language Settings
- **Language Selection**: Choose from multiple languages (English, Suomi, Español, Français, Deutsch)
- Note: Language support is currently for display only and will be implemented in future updates

### Theme Customization

#### Theme Presets
Five built-in theme presets:
- **Light**: Classic light theme with blue accents
- **Dark**: Modern dark theme with blue accents
- **Ocean**: Cool ocean-inspired theme with teal colors
- **Sunset**: Warm sunset theme with orange tones
- **Forest**: Dark forest theme with green accents

#### Custom Theme Colors
Customize individual color values for:
- **Primary Color**: Main accent color
- **Secondary Color**: Secondary accent color
- **Background**: Main background color
- **Surface**: Surface/card background color
- **Text**: Primary text color
- **Secondary Text**: Muted text color
- **Border**: Border color
- **Success**: Success state color
- **Warning**: Warning state color
- **Error**: Error state color

## Usage

### Opening Settings
1. Click the **Start** button in the taskbar
2. Select **Settings** from the menu

### Changing Language
1. Open Settings
2. Select desired language from the dropdown
3. Changes apply immediately

### Applying Theme Presets
1. Open Settings
2. Click on any theme preset button (Light, Dark, Ocean, Sunset, Forest)
3. Theme applies immediately across the entire application

### Creating Custom Themes
1. Open Settings
2. Scroll to "Custom Theme Colors" section
3. For each color:
   - Click the color preview box to use the color picker, OR
   - Type hex/rgb values directly into the text field
4. Click **Apply Custom Theme** to apply your custom colors
5. Use **Reset to Defaults** to restore the default light theme

## Technical Details

### Context API
Settings uses React Context (`SettingsContext`) to manage application-wide settings.

### Local Storage
All settings are automatically saved to browser's localStorage and persist across sessions.

### CSS Variables
Theme colors are applied using CSS custom properties (variables) that cascade throughout the application:
- `--color-primary`
- `--color-secondary`
- `--color-background`
- `--color-surface`
- `--color-text`
- `--color-text-secondary`
- `--color-border`
- `--color-success`
- `--color-warning`
- `--color-error`

### System Preference Detection
On first load, the application detects system color scheme preference (dark/light mode) and applies the appropriate default theme.

## Component Structure

```
src/components/Settings/
├── Settings.tsx       # Main component
├── Settings.css       # Component styles
└── index.ts          # Barrel export

src/contexts/
└── SettingsContext.tsx  # Settings state management

src/types/
└── settings.ts        # Type definitions and preset themes
```

## Props

The Settings component doesn't accept any props. It uses the `useSettings` hook to access and modify application settings.

## Example

```tsx
import { Settings } from './components/Settings';
import { SettingsProvider } from './contexts';

function App() {
  return (
    <SettingsProvider>
      <Settings />
    </SettingsProvider>
  );
}
```

## Accessibility

- All form controls have proper labels
- Color pickers have aria-labels
- Keyboard navigation supported
- Focus states clearly visible

## Browser Support

- Modern browsers with CSS custom properties support
- localStorage support required for persistence
- Color input type support for native color picker

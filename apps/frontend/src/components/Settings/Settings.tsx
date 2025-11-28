import type { ThemeColors } from "@linux-simulator/shared";
import { defaultThemes } from "@linux-simulator/shared";
import type { FC } from "react";
import { useRef, useState } from "react";
import { useSettings, useTranslations } from "../../contexts";
import "./Settings.css";

export const Settings: FC = () => {
  const { settings, updateLanguage, updateTheme, applyPresetTheme } =
    useSettings();
  const { t, availableLanguages } = useTranslations();

  const [customTheme, setCustomTheme] = useState<ThemeColors>(settings.theme);
  const colorPickerRefs = useRef<{ [key: string]: HTMLInputElement | null }>(
    {}
  );

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateLanguage(e.target.value);
  };

  const handlePresetTheme = (themeName: string) => {
    applyPresetTheme(themeName);
    setCustomTheme(defaultThemes[themeName]);
  };

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    const newTheme = { ...customTheme, [colorKey]: value };
    setCustomTheme(newTheme);
  };

  const handleApplyCustomTheme = () => {
    updateTheme(customTheme);
  };

  const handleResetToDefaults = () => {
    const defaultTheme = defaultThemes.light;
    setCustomTheme(defaultTheme);
    updateTheme(defaultTheme);
    updateLanguage("en");
  };

  const getCurrentPresetName = (): string | null => {
    for (const [name, theme] of Object.entries(defaultThemes)) {
      if (JSON.stringify(theme) === JSON.stringify(settings.theme)) {
        return name;
      }
    }
    return null;
  };

  const currentPreset = getCurrentPresetName();

  const tSettings = t.settings;

  const colorFields: { key: keyof ThemeColors; label: string }[] = [
    { key: "primary", label: tSettings.customTheme.colors.primary },
    { key: "secondary", label: tSettings.customTheme.colors.secondary },
    { key: "background", label: tSettings.customTheme.colors.background },
    { key: "surface", label: tSettings.customTheme.colors.surface },
    { key: "text", label: tSettings.customTheme.colors.text },
    { key: "textSecondary", label: tSettings.customTheme.colors.textSecondary },
    { key: "border", label: tSettings.customTheme.colors.border },
    { key: "success", label: tSettings.customTheme.colors.success },
    { key: "warning", label: tSettings.customTheme.colors.warning },
    { key: "error", label: tSettings.customTheme.colors.error },
  ];

  // Map language codes to display names
  const languageNames: Record<string, string> = {
    en: "English",
    fi: "Suomi",
  };

  return (
    <div className="settings-container">
      <div className="settings-section">
        <h2 className="settings-section-title">
          {tSettings.languageSettings.title}
        </h2>
        <div className="settings-field">
          <label htmlFor="language-select" className="settings-label">
            {tSettings.languageSettings.label}
          </label>
          <select
            id="language-select"
            className="settings-select"
            value={settings.language}
            onChange={handleLanguageChange}
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {languageNames[lang] || lang}
              </option>
            ))}
          </select>
          <p className="settings-description">
            {tSettings.languageSettings.description}
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">
          {tSettings.themePresets.title}
        </h2>
        <div className="theme-presets">
          {Object.keys(defaultThemes).map((themeName) => (
            <button
              key={themeName}
              type="button"
              className={`theme-preset-button ${currentPreset === themeName ? "active" : ""}`}
              onClick={() => handlePresetTheme(themeName)}
            >
              {tSettings.themePresets[
                themeName as keyof typeof tSettings.themePresets
              ] || themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">
          {tSettings.customTheme.title}
        </h2>
        <div className="theme-colors">
          {colorFields.map(({ key, label }) => (
            <div key={key} className="color-field">
              <label htmlFor={`color-${key}`} className="settings-label">
                {label}
              </label>
              <div className="color-input-wrapper">
                <button
                  type="button"
                  className="color-preview"
                  style={{ backgroundColor: customTheme[key] }}
                  onClick={() => colorPickerRefs.current[key]?.click()}
                  aria-label={tSettings.customTheme.aria.pickColor.replace(
                    "{label}",
                    label
                  )}
                />
                <input
                  type="text"
                  id={`color-${key}`}
                  className="color-input"
                  value={customTheme[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  placeholder="#000000"
                />
                <input
                  ref={(el) => {
                    colorPickerRefs.current[key] = el;
                  }}
                  type="color"
                  className="color-picker-native"
                  value={
                    customTheme[key].startsWith("#")
                      ? customTheme[key]
                      : "#000000"
                  }
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  aria-label={tSettings.customTheme.aria.colorPicker.replace(
                    "{label}",
                    label
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="settings-info">{tSettings.customTheme.tip}</div>

        <div className="settings-actions">
          <button
            type="button"
            className="settings-button settings-button-primary"
            onClick={handleApplyCustomTheme}
          >
            {tSettings.customTheme.actions.apply}
          </button>
          <button
            type="button"
            className="settings-button settings-button-secondary"
            onClick={handleResetToDefaults}
          >
            {tSettings.customTheme.actions.reset}
          </button>
        </div>
      </div>
    </div>
  );
};

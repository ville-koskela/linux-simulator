import { type LanguageCode, fallbackLanguage, languageCodeSchema } from "@linux-simulator/shared";

/**
 * Get the browser's preferred language
 * @param availableLanguages - List of supported language codes
 * @returns The best matching language code
 */
export const getBrowserLanguage = (availableLanguages: readonly LanguageCode[]): LanguageCode => {
  // Get browser languages in order of preference
  const browserLanguages = navigator.languages || [navigator.language];

  for (const lang of browserLanguages) {
    // Check exact match first (e.g., 'en-US' === 'en-US')
    const exactMatch = languageCodeSchema.safeParse(lang);
    if (exactMatch.success && availableLanguages.includes(exactMatch.data)) {
      return exactMatch.data;
    }

    // Check language code without region (e.g., 'en-US' -> 'en')
    const langCode = lang.split("-")[0];
    const parsedLangCode = languageCodeSchema.safeParse(langCode);
    if (parsedLangCode.success && availableLanguages.includes(parsedLangCode.data)) {
      return parsedLangCode.data;
    }
  }

  return fallbackLanguage;
};

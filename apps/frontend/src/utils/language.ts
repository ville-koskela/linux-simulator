/**
 * Get the browser's preferred language
 * @param availableLanguages - List of supported language codes
 * @param fallback - Fallback language if browser language is not supported
 * @returns The best matching language code
 */
export const getBrowserLanguage = (
  availableLanguages: string[],
  fallback = 'en'
): string => {
  // Get browser languages in order of preference
  const browserLanguages = navigator.languages || [navigator.language];

  for (const lang of browserLanguages) {
    // Check exact match first (e.g., 'en-US' === 'en-US')
    if (availableLanguages.includes(lang)) {
      return lang;
    }

    // Check language code without region (e.g., 'en-US' -> 'en')
    const langCode = lang.split('-')[0];
    if (availableLanguages.includes(langCode)) {
      return langCode;
    }
  }

  return fallback;
};

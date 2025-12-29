import type { LanguageCode, Translation } from "@linux-simulator/shared";
import { Injectable } from "@nestjs/common";
import { translationsEn } from "./translations.en";
import { translationsFi } from "./translations.fi";

/**
 * Map of all available translations
 * Type-safe: enforces that ALL LanguageCodes have a translation
 */
const translations: { [K in LanguageCode]: Translation } = {
  en: translationsEn,
  fi: translationsFi,
};

@Injectable()
export class TranslationsService {
  public getTranslations(languageCode: LanguageCode): Translation {
    return translations[languageCode];
  }
}

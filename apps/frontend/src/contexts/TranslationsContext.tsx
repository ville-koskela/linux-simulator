import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import translationsEn from '../data/translations-en.json';
import translationsFi from '../data/translations-fi.json';
import { useSettings } from './SettingsContext';

export type Translations = typeof translationsEn;

interface TranslationsContextValue {
  t: Translations;
  availableLanguages: string[];
}

const TranslationsContext = createContext<TranslationsContextValue | undefined>(
  undefined
);

export const useTranslations = () => {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error(
      'useTranslations must be used within a TranslationsProvider'
    );
  }
  return context;
};

interface TranslationsProviderProps {
  children: ReactNode;
}

const translationsMap: Record<string, Translations> = {
  en: translationsEn,
  fi: translationsFi,
};

// Get list of available languages from the translations map
const availableLanguages = Object.keys(translationsMap);

export const TranslationsProvider = ({
  children,
}: TranslationsProviderProps) => {
  const { settings } = useSettings();
  const [translations, setTranslations] =
    useState<Translations>(translationsEn);

  useEffect(() => {
    // Load the appropriate translation based on the language setting
    const selectedTranslation = translationsMap[settings.language];
    if (selectedTranslation) {
      setTranslations(selectedTranslation);
    } else {
      // Fallback to English if language not found
      setTranslations(translationsEn);
    }
  }, [settings.language]);

  const value: TranslationsContextValue = {
    t: translations,
    availableLanguages,
  };

  return (
    <TranslationsContext.Provider value={value}>
      {children}
    </TranslationsContext.Provider>
  );
};

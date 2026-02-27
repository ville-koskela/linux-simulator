import type { LanguageCode, Translation } from "@linux-simulator/shared";
import { availableLanguages, fallbackLanguage, translationSchema } from "@linux-simulator/shared";
import type { JSX, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useValidatedSessionStorage } from "../hooks";
import { fetchTranslations } from "../services/api.service";
import { useSettings } from "./SettingsContext";

interface TranslationsContextValue {
  t: Translation;
  availableLanguages: ReadonlyArray<{
    code: LanguageCode;
    name: string;
  }>;
  isLoading: boolean;
}

const TranslationsContext: React.Context<TranslationsContextValue | undefined> = createContext<
  TranslationsContextValue | undefined
>(undefined);

export const useTranslations = (): TranslationsContextValue => {
  const context: TranslationsContextValue | undefined = useContext(TranslationsContext);
  if (!context) {
    throw new Error("useTranslations must be used within a TranslationsProvider");
  }
  return context;
};

interface TranslationsProviderProps {
  children: ReactNode;
}

export const TranslationsProvider = ({ children }: TranslationsProviderProps): JSX.Element => {
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(true);

  // Use validated session storage for caching translations
  const [cachedTranslations, setCachedTranslations] =
    useValidatedSessionStorage<Translation | null>(
      `translations-${settings.language}`,
      null,
      translationSchema.nullable()
    );

  useEffect(() => {
    let isMounted = true;

    async function loadTranslations(): Promise<void> {
      setIsLoading(true);

      try {
        // Fetch from API
        const fetched = await fetchTranslations(settings.language);

        if (isMounted) {
          setCachedTranslations(fetched);
          setIsLoading(false);
        }
      } catch {
        // Try to use fallback language
        if (settings.language !== fallbackLanguage) {
          try {
            const fallbackFetched = await fetchTranslations(fallbackLanguage);
            if (isMounted) {
              setCachedTranslations(fallbackFetched);
              setIsLoading(false);
            }
            return;
          } catch {
            // Fallback also failed
          }
        }

        // Last resort: show error or empty state
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [settings.language, setCachedTranslations]);

  // Don't render children until we have translations
  if (!cachedTranslations && isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--color-background)",
          color: "var(--color-text)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid var(--color-border)",
              borderTop: "4px solid var(--color-primary)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <output aria-live="polite">Loading translations...</output>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  // Provide translations to children
  const value: TranslationsContextValue = {
    t: cachedTranslations || ({} as Translation),
    availableLanguages,
    isLoading,
  };

  return <TranslationsContext.Provider value={value}>{children}</TranslationsContext.Provider>;
};

import type { LanguageCode, Translation } from "@linux-simulator/shared";
import { fallbackLanguage, translationSchema } from "@linux-simulator/shared";

const API_BASE_URL: string = import.meta.env?.VITE_API_URL || "http://localhost:3000";

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | undefined> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  // Handle empty responses (e.g., DELETE requests)
  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

/**
 * Fetch translations from the API with validation
 * @param languageCode - The language code to fetch
 * @returns Validated translation object
 * @throws Error if fetch fails or validation fails
 */
export async function fetchTranslations(languageCode: LanguageCode): Promise<Translation> {
  try {
    const data = await apiFetch<unknown>(`/translations/${languageCode}`);

    // Validate the received data against the schema
    const validatedTranslations = translationSchema.parse(data);

    return validatedTranslations;
  } catch (error) {
    // If fetching the requested language fails, try fallback
    if (languageCode !== fallbackLanguage) {
      const fallbackData = await apiFetch<unknown>(`/translations/${fallbackLanguage}`);
      return translationSchema.parse(fallbackData);
    }

    throw error;
  }
}

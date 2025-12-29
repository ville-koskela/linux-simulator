import assert from "node:assert";
import { describe, it } from "node:test";
import type { LanguageCode } from "@linux-simulator/shared";
import { getBrowserLanguage } from "../../src/utils/language";
import { createDOM } from "../test-utils/create-dom";

describe("getBrowserLanguage", () => {
  const availableLanguages: readonly LanguageCode[] = ["en", "fi"];

  const createMockNavigator = (languages: string[] | undefined, language?: string): void => {
    createDOM();

    if (languages !== undefined) {
      Object.defineProperty(window.navigator, "languages", {
        value: languages,
        configurable: true,
        writable: true,
      });
    } else {
      // When undefined, remove the property to test fallback to navigator.language
      Object.defineProperty(window.navigator, "languages", {
        value: undefined,
        configurable: true,
        writable: true,
      });
    }

    if (language !== undefined) {
      Object.defineProperty(window.navigator, "language", {
        value: language,
        configurable: true,
        writable: true,
      });
    }
  };

  it("should return exact match when browser language is supported", () => {
    createMockNavigator(["en"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should return Finnish when browser prefers Finnish", () => {
    createMockNavigator(["fi"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "fi");
  });

  it("should match language code without region (en-US -> en)", () => {
    createMockNavigator(["en-US"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should match language code without region (en-GB -> en)", () => {
    createMockNavigator(["en-GB"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should match language code without region (fi-FI -> fi)", () => {
    createMockNavigator(["fi-FI"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "fi");
  });

  it("should return first matching language from multiple preferences", () => {
    createMockNavigator(["fr-FR", "de-DE", "fi-FI", "en-US"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "fi");
  });

  it("should prefer exact match over language code match", () => {
    createMockNavigator(["en"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should fall back to default language when no match found", () => {
    createMockNavigator(["de-DE", "fr-FR"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en"); // fallback language
  });

  it("should handle empty languages array", () => {
    createMockNavigator([], "en-US");

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should use navigator.language when navigator.languages is not available", () => {
    createMockNavigator(undefined, "fi-FI");

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "fi");
  });

  it("should handle navigator.language without region", () => {
    createMockNavigator(undefined, "en");

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should return fallback when navigator.language is unsupported", () => {
    createMockNavigator(undefined, "de-DE");

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should respect language preference order", () => {
    createMockNavigator(["fi-FI", "en-US"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "fi");
  });

  it("should respect language preference order (English first)", () => {
    createMockNavigator(["en-US", "fi-FI"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should handle case-sensitive language codes correctly", () => {
    createMockNavigator(["EN-US"]);

    // Schema validation should handle this - if not exact match, fallback
    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should handle mixed case language codes", () => {
    createMockNavigator(["Fi-fi"]);

    const result = getBrowserLanguage(availableLanguages);
    // Mixed case doesn't match schema, so falls back to splitting and checking "fi"
    // However, "Fi" also doesn't match the schema (which expects lowercase "fi")
    // So it falls back to the default language
    assert.strictEqual(result, "en");
  });

  it("should return fallback for completely invalid language code", () => {
    createMockNavigator(["invalid", "xyz"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should handle very long preference list", () => {
    createMockNavigator([
      "es-ES",
      "de-DE",
      "fr-FR",
      "it-IT",
      "pt-PT",
      "nl-NL",
      "sv-SE",
      "fi-FI",
      "en-US",
    ]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "fi");
  });

  it("should handle languages with multiple hyphens", () => {
    createMockNavigator(["en-US-x-twain"]);

    const result = getBrowserLanguage(availableLanguages);
    assert.strictEqual(result, "en");
  });

  it("should work with single available language", () => {
    createMockNavigator(["fi-FI"]);

    const result = getBrowserLanguage(["fi"]);
    assert.strictEqual(result, "fi");
  });

  it("should return fallback when available languages is empty", () => {
    createMockNavigator(["en-US"]);

    const result = getBrowserLanguage([]);
    assert.strictEqual(result, "en");
  });
});

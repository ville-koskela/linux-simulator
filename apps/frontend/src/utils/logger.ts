/**
 * Centralised logger for the frontend.
 *
 * All console calls live here so the biome `noConsole` rule only needs to be
 * suppressed in one place. Use `logger.*` everywhere else in the codebase.
 *
 * `info` and `debug` only emit in development builds; `warn` and `error`
 * always emit.
 */

const isDev: boolean = import.meta.env.DEV;

export const logger = {
  // biome-ignore lint/suspicious/noConsole: Single allowed location for console usage
  error: (...args: unknown[]): void => console.error(...args),
  // biome-ignore lint/suspicious/noConsole: Single allowed location for console usage
  warn: (...args: unknown[]): void => console.warn(...args),
  info: (...args: unknown[]): void => {
    // biome-ignore lint/suspicious/noConsole: Single allowed location for console usage
    if (isDev) console.info(...args);
  },
  debug: (...args: unknown[]): void => {
    // biome-ignore lint/suspicious/noConsole: Single allowed location for console usage
    if (isDev) console.debug(...args);
  },
};

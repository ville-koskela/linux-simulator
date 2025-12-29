/** biome-ignore-all lint/nursery/useExplicitType: For now we don't type schemas explicitly */
import { z } from "zod";
import { languageCodeSchema } from "./settings.js";

export const commandNameSchema = z.enum([
  "clear",
  "help",
  "echo",
  "date",
  "pwd",
  "ls",
  "cd",
  "cat",
  "mkdir",
  "touch",
  "rm",
  "mv",
  "vim",
  "vi",
  "exit",
]);

// Terminal command schemas
export const terminalCommandSchema = z.object({
  name: commandNameSchema,
  level: z.number().int().min(1), // Level required to unlock this command
  translations: z.record(
    languageCodeSchema,
    z.object({
      description: z.string(),
      usage: z.string(),
    })
  ), // Translations for all supported languages
});

export type TerminalCommand = z.infer<typeof terminalCommandSchema>;

export const commandResponseSchema = z.object({
  commands: z.array(terminalCommandSchema),
});

export type CommandResponse = z.infer<typeof commandResponseSchema>;

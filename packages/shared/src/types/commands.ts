/** biome-ignore-all lint/nursery/useExplicitType: For now we don't type schemas explicitly */
import { z } from "zod";

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
  description: z.string(),
  usage: z.string(),
  level: z.number().int().min(1), // Level required to unlock this command
});

export type TerminalCommand = z.infer<typeof terminalCommandSchema>;

export const commandResponseSchema = z.object({
  commands: z.array(terminalCommandSchema),
});

export type CommandResponse = z.infer<typeof commandResponseSchema>;

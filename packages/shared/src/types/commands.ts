/** biome-ignore-all lint/nursery/useExplicitType: For now we don't type schemas explicitly */
import { z } from "zod";

// Terminal command schemas
export const terminalCommandSchema = z.object({
  name: z.string(),
  description: z.string(),
  usage: z.string(),
});

export type TerminalCommand = z.infer<typeof terminalCommandSchema>;

export const commandResponseSchema = z.object({
  commands: z.array(terminalCommandSchema),
});

export type CommandResponse = z.infer<typeof commandResponseSchema>;

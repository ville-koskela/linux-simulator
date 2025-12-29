import type { TerminalCommand } from "@linux-simulator/shared";
import { commandResponseSchema } from "@linux-simulator/shared";
import { apiFetch } from "./api.service";

export const CommandsService = {
  async getCommands(): Promise<TerminalCommand[]> {
    const json = await apiFetch<unknown>("/commands");
    const data = commandResponseSchema.parse(json);
    return data.commands;
  },
};

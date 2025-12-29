import type { TerminalCommand } from "@linux-simulator/shared";

const API_BASE_URL: string = import.meta.env?.VITE_API_URL || "http://localhost:3000";

export const CommandsService = {
  async getCommands(): Promise<TerminalCommand[]> {
    const response = await fetch(`${API_BASE_URL}/commands`);
    if (!response.ok) {
      throw new Error(`Failed to fetch commands: ${response.status}`);
    }
    const data = await response.json();
    return data.commands;
  },
};

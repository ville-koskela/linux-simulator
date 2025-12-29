import type { TerminalCommand } from "./types/commands.js";

/**
 * Central definition of all terminal commands
 * Each command has a level that determines when it unlocks for the player
 */
export const TERMINAL_COMMANDS: readonly TerminalCommand[] = [
  // Level 1 - Basic commands
  {
    name: "echo",
    description: "Display a line of text",
    usage: "echo [text]",
    level: 1,
  },
  {
    name: "pwd",
    description: "Print working directory",
    usage: "pwd",
    level: 1,
  },
  {
    name: "ls",
    description: "List directory contents",
    usage: "ls [directory]",
    level: 1,
  },
  {
    name: "cd",
    description: "Change directory",
    usage: "cd [directory]",
    level: 1,
  },
  {
    name: "cat",
    description: "Display file contents",
    usage: "cat <file>",
    level: 1,
  },

  // Level 2 - File manipulation
  {
    name: "touch",
    description: "Create an empty file",
    usage: "touch <file>",
    level: 2,
  },
  {
    name: "mkdir",
    description: "Create a directory",
    usage: "mkdir <directory>",
    level: 2,
  },
  {
    name: "rm",
    description: "Remove a file or empty directory",
    usage: "rm <file>",
    level: 2,
  },
  {
    name: "mv",
    description: "Move or rename a file",
    usage: "mv <source> <destination>",
    level: 2,
  },

  // Level 3 - Editors
  {
    name: "vim",
    description: "Text editor (vi-compatible)",
    usage: "vim <file>",
    level: 3,
  },
  {
    name: "vi",
    description: "Text editor",
    usage: "vi <file>",
    level: 3,
  },

  // Utility commands (available at all levels)
  {
    name: "help",
    description: "Show available commands",
    usage: "help",
    level: 1,
  },
  {
    name: "date",
    description: "Display current date and time",
    usage: "date",
    level: 1,
  },
  {
    name: "exit",
    description: "Close the current terminal window",
    usage: "exit",
    level: 1,
  },
] as const;

/**
 * Get commands available at a specific level or below
 * @param userLevel - The user's current level
 * @returns Array of available commands
 */
export function getAvailableCommands(userLevel: number): TerminalCommand[] {
  return TERMINAL_COMMANDS.filter((cmd) => cmd.level <= userLevel);
}

/**
 * Get all commands (for when user level is not enforced)
 * @returns Array of all commands
 */
export function getAllCommands(): TerminalCommand[] {
  return [...TERMINAL_COMMANDS];
}

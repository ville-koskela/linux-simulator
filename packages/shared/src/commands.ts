import type { TerminalCommand } from "./types/commands.js";

/**
 * Central definition of all terminal commands
 * Each command has a level that determines when it unlocks for the player
 * Translations are included per command for easy maintenance
 */
export const TERMINAL_COMMANDS: readonly TerminalCommand[] = [
  // Level 1 - Basic commands
  {
    name: "echo",
    level: 1,
    translations: {
      en: {
        description: "Display a line of text",
        usage: "echo [text]",
      },
      fi: {
        description: "Näytä tekstirivi",
        usage: "echo [teksti]",
      },
    },
  },
  {
    name: "pwd",
    level: 1,
    translations: {
      en: {
        description: "Print working directory",
        usage: "pwd",
      },
      fi: {
        description: "Tulosta työkansio",
        usage: "pwd",
      },
    },
  },
  {
    name: "ls",
    level: 1,
    translations: {
      en: {
        description: "List directory contents",
        usage: "ls [directory]",
      },
      fi: {
        description: "Listaa kansion sisältö",
        usage: "ls [kansio]",
      },
    },
  },
  {
    name: "cd",
    level: 1,
    translations: {
      en: {
        description: "Change directory",
        usage: "cd [directory]",
      },
      fi: {
        description: "Vaihda kansiota",
        usage: "cd [kansio]",
      },
    },
  },
  {
    name: "cat",
    level: 1,
    translations: {
      en: {
        description: "Display file contents",
        usage: "cat <file>",
      },
      fi: {
        description: "Näytä tiedoston sisältö",
        usage: "cat <tiedosto>",
      },
    },
  },

  // Level 2 - File manipulation
  {
    name: "touch",
    level: 2,
    translations: {
      en: {
        description: "Create an empty file",
        usage: "touch <file>",
      },
      fi: {
        description: "Luo tyhjä tiedosto",
        usage: "touch <tiedosto>",
      },
    },
  },
  {
    name: "mkdir",
    level: 2,
    translations: {
      en: {
        description: "Create a directory",
        usage: "mkdir <directory>",
      },
      fi: {
        description: "Luo kansio",
        usage: "mkdir <kansio>",
      },
    },
  },
  {
    name: "rm",
    level: 2,
    translations: {
      en: {
        description: "Remove a file or empty directory",
        usage: "rm <file>",
      },
      fi: {
        description: "Poista tiedostoja tai kansioita",
        usage: "rm <tiedosto|kansio>",
      },
    },
  },
  {
    name: "mv",
    level: 2,
    translations: {
      en: {
        description: "Move or rename a file",
        usage: "mv <source> <destination>",
      },
      fi: {
        description: "Siirrä tai nimeä tiedostoja uudelleen",
        usage: "mv <lähde> <kohde>",
      },
    },
  },

  // Level 3 - Editors
  {
    name: "vim",
    level: 3,
    translations: {
      en: {
        description: "Text editor (vi-compatible)",
        usage: "vim <file>",
      },
      fi: {
        description: "Tekstieditori (vi-yhteensopiva)",
        usage: "vim <tiedosto>",
      },
    },
  },
  {
    name: "vi",
    level: 3,
    translations: {
      en: {
        description: "Text editor",
        usage: "vi <file>",
      },
      fi: {
        description: "Tekstieditori",
        usage: "vi <tiedosto>",
      },
    },
  },

  // Utility commands (available at all levels)
  {
    name: "help",
    level: 1,
    translations: {
      en: {
        description: "Show available commands",
        usage: "help",
      },
      fi: {
        description: "Näytä käytettävissä olevat komennot",
        usage: "help",
      },
    },
  },
  {
    name: "date",
    level: 1,
    translations: {
      en: {
        description: "Display current date and time",
        usage: "date",
      },
      fi: {
        description: "Näytä nykyinen päivämäärä ja aika",
        usage: "date",
      },
    },
  },
  {
    name: "exit",
    level: 1,
    translations: {
      en: {
        description: "Close the current terminal window",
        usage: "exit",
      },
      fi: {
        description: "Sulje nykyinen pääteikkuna",
        usage: "exit",
      },
    },
  },
  {
    name: "clear",
    level: 1,
    translations: {
      en: {
        description: "Clear terminal screen",
        usage: "clear",
      },
      fi: {
        description: "Tyhjennä pääte",
        usage: "clear",
      },
    },
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

import type { FilesystemNode, TerminalCommand, Translation } from "@linux-simulator/shared";

export interface CommandContext {
  currentPath: string;
  currentNode: FilesystemNode | null;
  addOutput: (content: string, type?: "output" | "error") => void;
  setCurrentPath: (path: string) => void;
  setCurrentNode: (node: FilesystemNode | null) => void;
  resolvePath: (path: string) => string;
  openEditor?: (filepath: string, content: string) => void;
  closeWindow?: () => void;
  commands?: TerminalCommand[];
  translations?: Translation;
}

export type CommandHandler = (args: string[], context: CommandContext) => void | Promise<void>;

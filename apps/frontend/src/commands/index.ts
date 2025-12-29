import type { TerminalCommand } from "@linux-simulator/shared";
import { dateCommand, echoCommand, exitCommand, helpCommand, pwdCommand } from "./basic-commands";
import { vimCommand } from "./editor-commands";
import {
  catCommand,
  cdCommand,
  lsCommand,
  mkdirCommand,
  mvCommand,
  rmCommand,
  touchCommand,
} from "./filesystem-commands";
import type { CommandHandler } from "./types";

export function getCommandHandler(commandName: TerminalCommand["name"]): CommandHandler {
  switch (commandName) {
    case "cat":
      return catCommand;
    case "cd":
      return cdCommand;
    case "echo":
      return echoCommand;
    case "exit":
      return exitCommand;
    case "help":
      return helpCommand;
    case "ls":
      return lsCommand;
    case "mkdir":
      return mkdirCommand;
    case "mv":
      return mvCommand;
    case "pwd":
      return pwdCommand;
    case "rm":
      return rmCommand;
    case "touch":
      return touchCommand;
    case "date":
      return dateCommand;
    case "vim":
      return vimCommand;
    case "vi":
      return vimCommand;
    default:
      throw new Error(commandName satisfies never);
  }
}

export type { CommandContext, CommandHandler } from "./types";

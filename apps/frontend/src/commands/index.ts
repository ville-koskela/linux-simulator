import { dateCommand, echoCommand, pwdCommand } from "./basic-commands";
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

export const commandHandlers: Record<string, CommandHandler> = {
  echo: echoCommand,
  date: dateCommand,
  pwd: pwdCommand,
  ls: lsCommand,
  cd: cdCommand,
  cat: catCommand,
  mkdir: mkdirCommand,
  touch: touchCommand,
  rm: rmCommand,
  mv: mvCommand,
};

export type { CommandContext, CommandHandler } from "./types";

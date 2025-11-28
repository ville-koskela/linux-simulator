import type { CommandHandler } from "./types";

export const echoCommand: CommandHandler = (_args, context) => {
  context.addOutput(_args.join(" ") || "");
};

export const dateCommand: CommandHandler = (_args, context) => {
  context.addOutput(new Date().toLocaleString());
};

export const pwdCommand: CommandHandler = (_args, context) => {
  context.addOutput(context.currentPath);
};

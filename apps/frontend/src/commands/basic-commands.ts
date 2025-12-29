import { fallbackLanguage } from "@linux-simulator/shared";
import type { CommandContext, CommandHandler } from "./types";

export const echoCommand: CommandHandler = (args: Array<string>, context: CommandContext) => {
  context.addOutput(args.join(" ") || "");
};

export const dateCommand: CommandHandler = (_args: Array<string>, context: CommandContext) => {
  context.addOutput(new Date().toLocaleString());
};

export const pwdCommand: CommandHandler = (_args: Array<string>, context: CommandContext) => {
  context.addOutput(context.currentPath);
};

export const exitCommand: CommandHandler = (_args: Array<string>, context: CommandContext) => {
  if (context.closeWindow) {
    context.closeWindow();
  }
};

export const helpCommand: CommandHandler = (_args: Array<string>, context: CommandContext) => {
  if (!context.commands || !context.translations) {
    context.addOutput("Help not available", "error");
    return;
  }

  const t = context.translations;
  const tTerminal = t.terminal;
  const languageCode = context.languageCode || fallbackLanguage;

  const helpText = [
    tTerminal.help.title,
    "",
    ...context.commands.map((cmd) => {
      // Get translated description, fallback to fallback language if translation missing
      const translation = cmd.translations[languageCode] || cmd.translations[fallbackLanguage];
      return `  ${cmd.name.padEnd(10)} - ${translation?.description || "N/A"}`;
    }),
  ];

  for (const line of helpText) {
    context.addOutput(line);
  }
};

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
  const tCommands = t.terminalCommands;

  const helpText = [
    tTerminal.help.title,
    "",
    ...context.commands.map((cmd) => {
      const cmdKey = cmd.name as keyof typeof tCommands;
      const description = tCommands[cmdKey]?.description || cmd.description;
      return `  ${cmd.name.padEnd(10)} - ${description}`;
    }),
    `  ${tTerminal.help.helpCommand}`,
    `  ${tTerminal.help.clearCommand}`,
  ];

  for (const line of helpText) {
    context.addOutput(line);
  }
};

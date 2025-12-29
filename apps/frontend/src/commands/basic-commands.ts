import type { CommandContext, CommandHandler } from "./types";

export const echoCommand: CommandHandler = (args: Array<string>, context: CommandContext) => {
  context.addOutput(args.join(" ") || "");
};

// biome-ignore lint/correctness/noUnusedFunctionParameters: fix later
export const dateCommand: CommandHandler = (args: Array<string>, context: CommandContext) => {
  context.addOutput(new Date().toLocaleString());
};

// biome-ignore lint/correctness/noUnusedFunctionParameters: fix later
export const pwdCommand: CommandHandler = (args: Array<string>, context: CommandContext) => {
  context.addOutput(context.currentPath);
};

// biome-ignore lint/correctness/noUnusedFunctionParameters: fix later
export const exitCommand: CommandHandler = (args: Array<string>, context: CommandContext) => {
  if (context.closeWindow) {
    context.closeWindow();
  }
};

import { FilesystemService } from "../services";
import type { CommandHandler } from "./types";

export const vimCommand: CommandHandler = async (args, context) => {
  if (args.length === 0) {
    context.addOutput("vim: missing file operand", "error");
    return;
  }

  try {
    const path = context.resolvePath(args[0]);
    const node = await FilesystemService.getNodeByPath(path);

    if (node && node.type === "directory") {
      context.addOutput(`vim: ${args[0]}: Is a directory`, "error");
      return;
    }

    // File exists or will be created
    const content = node?.content || "";
    
    // Open the vim editor
    if (context.openEditor) {
      context.openEditor(path, content);
    }
  } catch (error) {
    context.addOutput(`vim: error: ${error}`, "error");
  }
};

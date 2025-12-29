import { FilesystemService } from "../services";
import type { CommandContext, CommandHandler } from "./types";

export const lsCommand: CommandHandler = async (args: Array<string>, context: CommandContext) => {
  try {
    const path = args[0] ? context.resolvePath(args[0]) : context.currentPath;
    const node = await FilesystemService.getNodeByPath(path);

    if (!node) {
      context.addOutput(
        `ls: cannot access '${args[0] || "."}': No such file or directory`,
        "error"
      );
      return;
    }

    if (node.type === "file") {
      context.addOutput(node.name);
      return;
    }

    const children = await FilesystemService.getChildren(node.id);
    if (children.length === 0) {
      context.addOutput("");
      return;
    }

    const dirs = children.filter((c) => c.type === "directory").map((c) => c.name);
    const files = children.filter((c) => c.type === "file").map((c) => c.name);
    const allNames = [...dirs, ...files];

    context.addOutput(allNames.join("  "));
  } catch (error) {
    context.addOutput(`ls: error: ${error}`, "error");
  }
};

export const cdCommand: CommandHandler = async (args: Array<string>, context: CommandContext) => {
  try {
    if (args.length === 0) {
      // cd with no args goes to root
      const root = await FilesystemService.getNodeByPath("/");
      if (root) {
        context.setCurrentPath("/");
        context.setCurrentNode(root);
      }
      return;
    }

    const path = context.resolvePath(args[0]);
    const node = await FilesystemService.getNodeByPath(path);

    if (!node) {
      context.addOutput(`cd: ${args[0]}: No such file or directory`, "error");
      return;
    }

    if (node.type !== "directory") {
      context.addOutput(`cd: ${args[0]}: Not a directory`, "error");
      return;
    }

    context.setCurrentPath(path);
    context.setCurrentNode(node);
    context.addOutput("");
  } catch (error) {
    context.addOutput(`cd: error: ${error}`, "error");
  }
};

export const catCommand: CommandHandler = async (args: Array<string>, context: CommandContext) => {
  if (args.length === 0) {
    context.addOutput("cat: missing file operand", "error");
    return;
  }

  try {
    const path = context.resolvePath(args[0]);
    const node = await FilesystemService.getNodeByPath(path);

    if (!node) {
      context.addOutput(`cat: ${args[0]}: No such file or directory`, "error");
      return;
    }

    if (node.type !== "file") {
      context.addOutput(`cat: ${args[0]}: Is a directory`, "error");
      return;
    }

    context.addOutput(node.content || "");
  } catch (error) {
    context.addOutput(`cat: error: ${error}`, "error");
  }
};

export const mkdirCommand: CommandHandler = async (
  args: Array<string>,
  context: CommandContext
) => {
  if (args.length === 0) {
    context.addOutput("mkdir: missing operand", "error");
    return;
  }

  try {
    const name = args[0];
    if (name.includes("/")) {
      context.addOutput("mkdir: only simple names supported (no paths)", "error");
      return;
    }

    if (!context.currentNode) {
      context.addOutput("mkdir: current directory not found", "error");
      return;
    }

    await FilesystemService.createNode(context.currentNode.id, name, "directory");
    context.addOutput("");
  } catch (error) {
    context.addOutput(`mkdir: error: ${error}`, "error");
  }
};

export const touchCommand: CommandHandler = async (
  args: Array<string>,
  context: CommandContext
) => {
  if (args.length === 0) {
    context.addOutput("touch: missing file operand", "error");
    return;
  }

  try {
    const name = args[0];
    if (name.includes("/")) {
      context.addOutput("touch: only simple names supported (no paths)", "error");
      return;
    }

    if (!context.currentNode) {
      context.addOutput("touch: current directory not found", "error");
      return;
    }

    await FilesystemService.createNode(context.currentNode.id, name, "file", "");
    context.addOutput("");
  } catch (error) {
    context.addOutput(`touch: error: ${error}`, "error");
  }
};

export const rmCommand: CommandHandler = async (args: Array<string>, context: CommandContext) => {
  if (args.length === 0) {
    context.addOutput("rm: missing operand", "error");
    return;
  }

  try {
    const path = context.resolvePath(args[0]);
    const node = await FilesystemService.getNodeByPath(path);

    if (!node) {
      context.addOutput(`rm: cannot remove '${args[0]}': No such file or directory`, "error");
      return;
    }

    if (node.type === "directory") {
      const children = await FilesystemService.getChildren(node.id);
      if (children.length > 0) {
        context.addOutput(`rm: cannot remove '${args[0]}': Directory not empty`, "error");
        return;
      }
    }

    await FilesystemService.deleteNode(node.id);
    context.addOutput("");
  } catch (error) {
    context.addOutput(`rm: error: ${error}`, "error");
  }
};

export const mvCommand: CommandHandler = async (args: Array<string>, context: CommandContext) => {
  if (args.length < 2) {
    context.addOutput("mv: missing operand", "error");
    return;
  }

  try {
    const sourcePath = context.resolvePath(args[0]);
    const destName = args[1];

    const sourceNode = await FilesystemService.getNodeByPath(sourcePath);
    if (!sourceNode) {
      context.addOutput(`mv: cannot stat '${args[0]}': No such file or directory`, "error");
      return;
    }

    // Simple rename in current directory
    if (!destName.includes("/")) {
      await FilesystemService.updateNode(sourceNode.id, { name: destName });
      context.addOutput("");
      return;
    }

    context.addOutput("mv: moving between directories not yet supported", "error");
  } catch (error) {
    context.addOutput(`mv: error: ${error}`, "error");
  }
};

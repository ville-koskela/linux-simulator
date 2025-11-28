import type { FilesystemNode } from "@linux-simulator/shared";
import type { FC, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "../../contexts";
import terminalCommands from "../../data/terminal-commands.json";
import { FilesystemService } from "../../services";
import "./Terminal.css";

interface TerminalLine {
  type: "input" | "output" | "error";
  content: string;
}

interface Command {
  name: string;
  description: string;
  usage: string;
  execute: string;
}

export const Terminal: FC = () => {
  const { t } = useTranslations();
  const tTerminal = t.terminal;
  const tCommands = t.terminalCommands;

  const [history, setHistory] = useState<TerminalLine[]>([
    { type: "output", content: tTerminal.welcome.version },
    { type: "output", content: tTerminal.welcome.help },
    { type: "output", content: "" },
  ]);
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState("/");
  const [currentNode, setCurrentNode] = useState<FilesystemNode | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyLengthRef = useRef(history.length);

  const commands: Command[] = terminalCommands.commands;

  // Initialize filesystem
  useEffect(() => {
    FilesystemService.getNodeByPath("/").then((node) => {
      setCurrentNode(node);
    });
  }, []);

  useEffect(() => {
    if (history.length !== historyLengthRef.current) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
      historyLengthRef.current = history.length;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const executeCommand = (commandLine: string) => {
    const trimmed = commandLine.trim();
    if (!trimmed) return;

    // Add command to history
    setHistory((prev) => [...prev, { type: "input", content: `$ ${trimmed}` }]);

    const [commandName, ...args] = trimmed.split(" ");
    const command = commands.find((cmd) => cmd.name === commandName);

    if (commandName === "help") {
      const helpText = [
        tTerminal.help.title,
        "",
        ...commands.map((cmd) => {
          const cmdKey = cmd.name as keyof typeof tCommands;
          const description = tCommands[cmdKey]?.description || cmd.description;
          return `  ${cmd.name.padEnd(10)} - ${description}`;
        }),
        `  ${tTerminal.help.helpCommand}`,
        `  ${tTerminal.help.clearCommand}`,
      ];
      setHistory((prev) => [
        ...prev,
        ...helpText.map((line) => ({ type: "output" as const, content: line })),
        { type: "output", content: "" },
      ]);
    } else if (commandName === "clear") {
      setHistory([]);
    } else if (command) {
      executeBuiltinCommand(command.execute, args);
    } else {
      setHistory((prev) => [
        ...prev,
        {
          type: "error",
          content: tTerminal.errors.commandNotFound.replace(
            "{command}",
            commandName
          ),
        },
        { type: "output", content: "" },
      ]);
    }

    // Add to command history
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
  };

  const executeBuiltinCommand = (commandType: string, args: string[]): void => {
    switch (commandType) {
      case "echo":
        addOutput(args.join(" ") || "");
        break;
      case "date":
        addOutput(new Date().toLocaleString());
        break;
      case "pwd":
        executePwd();
        break;
      case "ls":
        executeLs(args);
        break;
      case "cd":
        executeCd(args);
        break;
      case "cat":
        executeCat(args);
        break;
      case "mkdir":
        executeMkdir(args);
        break;
      case "touch":
        executeTouch(args);
        break;
      case "rm":
        executeRm(args);
        break;
      case "mv":
        executeMv(args);
        break;
      default:
        addOutput(tTerminal.errors.notImplemented);
    }
  };

  const addOutput = (content: string, type: "output" | "error" = "output") => {
    setHistory((prev) => [
      ...prev,
      { type, content },
      { type: "output", content: "" },
    ]);
  };

  const resolvePath = (path: string): string => {
    if (path.startsWith("/")) {
      return path;
    }
    const base = currentPath === "/" ? "" : currentPath;
    return `${base}/${path}`.replace(/\/+/g, "/");
  };

  const executePwd = () => {
    addOutput(currentPath);
  };

  const executeLs = async (args: string[]) => {
    try {
      const path = args[0] ? resolvePath(args[0]) : currentPath;
      const node = await FilesystemService.getNodeByPath(path);

      if (!node) {
        addOutput(
          `ls: cannot access '${args[0] || "."}': No such file or directory`,
          "error"
        );
        return;
      }

      if (node.type === "file") {
        addOutput(node.name);
        return;
      }

      const children = await FilesystemService.getChildren(node.id);
      if (children.length === 0) {
        addOutput("");
        return;
      }

      const dirs = children
        .filter((c) => c.type === "directory")
        .map((c) => c.name);
      const files = children
        .filter((c) => c.type === "file")
        .map((c) => c.name);
      const allNames = [...dirs, ...files];

      addOutput(allNames.join("  "));
    } catch (error) {
      addOutput(`ls: error: ${error}`, "error");
    }
  };

  const executeCd = async (args: string[]) => {
    try {
      if (args.length === 0) {
        // cd with no args goes to root
        const root = await FilesystemService.getNodeByPath("/");
        if (root) {
          setCurrentPath("/");
          setCurrentNode(root);
        }
        return;
      }

      const path = resolvePath(args[0]);
      const node = await FilesystemService.getNodeByPath(path);

      if (!node) {
        addOutput(`cd: ${args[0]}: No such file or directory`, "error");
        return;
      }

      if (node.type !== "directory") {
        addOutput(`cd: ${args[0]}: Not a directory`, "error");
        return;
      }

      setCurrentPath(path);
      setCurrentNode(node);
      addOutput("");
    } catch (error) {
      addOutput(`cd: error: ${error}`, "error");
    }
  };

  const executeCat = async (args: string[]) => {
    if (args.length === 0) {
      addOutput("cat: missing file operand", "error");
      return;
    }

    try {
      const path = resolvePath(args[0]);
      const node = await FilesystemService.getNodeByPath(path);

      if (!node) {
        addOutput(`cat: ${args[0]}: No such file or directory`, "error");
        return;
      }

      if (node.type !== "file") {
        addOutput(`cat: ${args[0]}: Is a directory`, "error");
        return;
      }

      addOutput(node.content || "");
    } catch (error) {
      addOutput(`cat: error: ${error}`, "error");
    }
  };

  const executeMkdir = async (args: string[]) => {
    if (args.length === 0) {
      addOutput("mkdir: missing operand", "error");
      return;
    }

    try {
      const name = args[0];
      if (name.includes("/")) {
        addOutput("mkdir: only simple names supported (no paths)", "error");
        return;
      }

      if (!currentNode) {
        addOutput("mkdir: current directory not found", "error");
        return;
      }

      await FilesystemService.createNode(currentNode.id, name, "directory");
      addOutput("");
    } catch (error) {
      addOutput(`mkdir: error: ${error}`, "error");
    }
  };

  const executeTouch = async (args: string[]) => {
    if (args.length === 0) {
      addOutput("touch: missing file operand", "error");
      return;
    }

    try {
      const name = args[0];
      if (name.includes("/")) {
        addOutput("touch: only simple names supported (no paths)", "error");
        return;
      }

      if (!currentNode) {
        addOutput("touch: current directory not found", "error");
        return;
      }

      await FilesystemService.createNode(currentNode.id, name, "file", "");
      addOutput("");
    } catch (error) {
      addOutput(`touch: error: ${error}`, "error");
    }
  };

  const executeRm = async (args: string[]) => {
    if (args.length === 0) {
      addOutput("rm: missing operand", "error");
      return;
    }

    try {
      const path = resolvePath(args[0]);
      const node = await FilesystemService.getNodeByPath(path);

      if (!node) {
        addOutput(
          `rm: cannot remove '${args[0]}': No such file or directory`,
          "error"
        );
        return;
      }

      if (node.type === "directory") {
        const children = await FilesystemService.getChildren(node.id);
        if (children.length > 0) {
          addOutput(
            `rm: cannot remove '${args[0]}': Directory not empty`,
            "error"
          );
          return;
        }
      }

      await FilesystemService.deleteNode(node.id);
      addOutput("");
    } catch (error) {
      addOutput(`rm: error: ${error}`, "error");
    }
  };

  const executeMv = async (args: string[]) => {
    if (args.length < 2) {
      addOutput("mv: missing operand", "error");
      return;
    }

    try {
      const sourcePath = resolvePath(args[0]);
      const destName = args[1];

      const sourceNode = await FilesystemService.getNodeByPath(sourcePath);
      if (!sourceNode) {
        addOutput(
          `mv: cannot stat '${args[0]}': No such file or directory`,
          "error"
        );
        return;
      }

      // Simple rename in current directory
      if (!destName.includes("/")) {
        await FilesystemService.updateNode(sourceNode.id, { name: destName });
        addOutput("");
        return;
      }

      addOutput("mv: moving between directories not yet supported", "error");
    } catch (error) {
      addOutput(`mv: error: ${error}`, "error");
    }
  };

  const handleSubmit = () => {
    if (input.trim()) {
      executeCommand(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: Terminal needs to be a clickable div for proper styling
    <div
      className="terminal"
      onClick={() => inputRef.current?.focus()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          inputRef.current?.focus();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="terminal-output">
        {history.map((line, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Terminal history lines need stable keys
          <div key={index} className={`terminal-line terminal-${line.type}`}>
            {line.content}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>
      <div className="terminal-input-line">
        <span className="terminal-prompt">{currentPath} $</span>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

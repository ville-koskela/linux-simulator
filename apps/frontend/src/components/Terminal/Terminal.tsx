import type { FilesystemNode, TerminalCommand } from "@linux-simulator/shared";
import type { FC, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { CommandContext } from "../../commands";
import { commandHandlers } from "../../commands";
import { useTranslations } from "../../contexts";
import { CommandsService, FilesystemService } from "../../services";
import { VimEditor } from "../VimEditor/VimEditor";
import "./Terminal.css";

interface TerminalLine {
  type: "input" | "output" | "error";
  content: string;
}

interface TerminalProps {
  onClose?: () => void;
}

export const Terminal: FC<TerminalProps> = ({ onClose }: TerminalProps) => {
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
  const [commands, setCommands] = useState<TerminalCommand[]>([]);
  const [editorState, setEditorState] = useState<{
    isOpen: boolean;
    filepath: string;
    content: string;
  } | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyLengthRef = useRef(history.length);

  // Load commands from API
  useEffect(() => {
    CommandsService.getCommands().then((cmds) => {
      setCommands(cmds);
    });
  }, []);

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

  // Re-focus input when editor closes
  useEffect(() => {
    if (!editorState?.isOpen) {
      inputRef.current?.focus();
    }
  }, [editorState?.isOpen]);

  const executeCommand = (commandLine: string): void => {
    const trimmed = commandLine.trim();
    if (!trimmed) return;

    // Add command to history
    setHistory((prev) => [...prev, { type: "input", content: `$ ${trimmed}` }]);

    const [commandName, ...args] = trimmed.split(" ");

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
    } else {
      executeBuiltinCommand(commandName, args);
    }

    // Add to command history
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
  };

  const addOutput = (content: string, type: "output" | "error" = "output"): void => {
    setHistory((prev) => [...prev, { type, content }, { type: "output", content: "" }]);
  };

  const resolvePath = (path: string): string => {
    if (path.startsWith("/")) {
      return path;
    }
    const base = currentPath === "/" ? "" : currentPath;
    return `${base}/${path}`.replace(/\/+/g, "/");
  };

  const openEditor = (filepath: string, content: string): void => {
    setEditorState({ isOpen: true, filepath, content });
  };

  const closeEditor = (): void => {
    setEditorState(null);
  };

  const executeBuiltinCommand = (commandName: string, args: string[]): void => {
    const handler = commandHandlers[commandName];

    if (!handler) {
      setHistory((prev) => [
        ...prev,
        {
          type: "error",
          content: tTerminal.errors.commandNotFound.replace("{command}", commandName),
        },
        { type: "output", content: "" },
      ]);
      return;
    }

    const context: CommandContext = {
      currentPath,
      currentNode,
      addOutput,
      setCurrentPath,
      setCurrentNode,
      resolvePath,
      openEditor,
      closeWindow: onClose,
    };

    handler(args, context);
  };

  const handleSubmit = (): void => {
    if (input.trim()) {
      executeCommand(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
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

  if (editorState?.isOpen) {
    return (
      <VimEditor
        filepath={editorState.filepath}
        initialContent={editorState.content}
        onClose={closeEditor}
      />
    );
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: Terminal needs to be a clickable div for proper styling
    <div
      className="terminal"
      onClick={(): void => inputRef.current?.focus()}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>): void => {
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
};

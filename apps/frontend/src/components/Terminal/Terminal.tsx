import type { FC, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '../../contexts';
import terminalCommands from '../../data/terminal-commands.json';
import './Terminal.css';

interface TerminalLine {
  type: 'input' | 'output' | 'error';
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
    { type: 'output', content: tTerminal.welcome.version },
    { type: 'output', content: tTerminal.welcome.help },
    { type: 'output', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyLengthRef = useRef(history.length);

  const commands: Command[] = terminalCommands.commands;

  useEffect(() => {
    if (history.length !== historyLengthRef.current) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setHistory((prev) => [...prev, { type: 'input', content: `$ ${trimmed}` }]);

    const [commandName, ...args] = trimmed.split(' ');
    const command = commands.find((cmd) => cmd.name === commandName);

    if (commandName === 'help') {
      const helpText = [
        tTerminal.help.title,
        '',
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
        ...helpText.map((line) => ({ type: 'output' as const, content: line })),
        { type: 'output', content: '' },
      ]);
    } else if (commandName === 'clear') {
      setHistory([]);
    } else if (command) {
      const output = executeBuiltinCommand(command.execute, args);
      setHistory((prev) => [
        ...prev,
        { type: 'output', content: output },
        { type: 'output', content: '' },
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        {
          type: 'error',
          content: tTerminal.errors.commandNotFound.replace(
            '{command}',
            commandName
          ),
        },
        { type: 'output', content: '' },
      ]);
    }

    // Add to command history
    setCommandHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
  };

  const executeBuiltinCommand = (
    commandType: string,
    args: string[]
  ): string => {
    switch (commandType) {
      case 'echo':
        return args.join(' ') || '';
      case 'date':
        return new Date().toLocaleString();
      default:
        return tTerminal.errors.notImplemented;
    }
  };

  const handleSubmit = () => {
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
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
        if (e.key === 'Enter' || e.key === ' ') {
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
        <span className="terminal-prompt">{tTerminal.prompt}</span>
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

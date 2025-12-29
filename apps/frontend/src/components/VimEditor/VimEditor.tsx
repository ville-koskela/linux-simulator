import type { FC, JSX, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { FilesystemService } from "../../services";
import "./VimEditor.css";

type VimMode = "normal" | "insert" | "command";

interface VimEditorProps {
  filepath: string;
  initialContent: string;
  onClose: () => void;
  onSave?: (content: string) => void;
}

export const VimEditor: FC<VimEditorProps> = ({
  filepath,
  initialContent,
  onClose,
  onSave,
}: VimEditorProps): JSX.Element => {
  const [mode, setMode] = useState<VimMode>("normal");
  const [lines, setLines] = useState<string[]>(initialContent ? initialContent.split("\n") : [""]);
  const [cursorRow, setCursorRow] = useState(0);
  const [cursorCol, setCursorCol] = useState(0);
  const [commandInput, setCommandInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [modified, setModified] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentLine = (): string => lines[cursorRow] || "";

  const setCurrentLine = (newLine: string): void => {
    const newLines = [...lines];
    newLines[cursorRow] = newLine;
    setLines(newLines);
    setModified(true);
  };

  const moveCursor = (row: number, col: number): void => {
    const newRow = Math.max(0, Math.min(row, lines.length - 1));
    const lineLength = lines[newRow]?.length || 0;
    const maxCol = mode === "insert" ? lineLength : Math.max(0, lineLength - 1);
    const newCol = Math.max(0, Math.min(col, maxCol));
    setCursorRow(newRow);
    setCursorCol(newCol);
  };

  const saveFile = async (): Promise<void> => {
    try {
      const content = lines.join("\n");
      await FilesystemService.updateFileContent(filepath, content);
      setModified(false);
      setStatusMessage(`"${filepath}" written`);
      if (onSave) {
        onSave(content);
      }
    } catch (error) {
      setStatusMessage(`Error: ${error instanceof Error ? error.message : "Failed to save"}`);
    }
  };

  const executeCommand = async (cmd: string): Promise<void> => {
    const trimmed = cmd.trim();

    if (trimmed === "q") {
      if (modified) {
        setStatusMessage("No write since last change (add ! to override)");
      } else {
        onClose();
      }
    } else if (trimmed === "q!") {
      onClose();
    } else if (trimmed === "w") {
      await saveFile();
    } else if (trimmed === "wq" || trimmed === "x") {
      await saveFile();
      onClose();
    } else {
      setStatusMessage(`Not an editor command: ${trimmed}`);
    }
  };

  const handleNormalModeKey = (key: string): void => {
    switch (key) {
      case "i":
        setMode("insert");
        setStatusMessage("-- INSERT --");
        break;
      case "I":
        setMode("insert");
        setCursorCol(0);
        setStatusMessage("-- INSERT --");
        break;
      case "a":
        setMode("insert");
        moveCursor(cursorRow, cursorCol + 1);
        setStatusMessage("-- INSERT --");
        break;
      case "A":
        setMode("insert");
        setCursorCol(getCurrentLine().length);
        setStatusMessage("-- INSERT --");
        break;
      case "o": {
        setMode("insert");
        const newLines = [...lines];
        newLines.splice(cursorRow + 1, 0, "");
        setLines(newLines);
        setCursorRow(cursorRow + 1);
        setCursorCol(0);
        setModified(true);
        setStatusMessage("-- INSERT --");
        break;
      }
      case "O": {
        const newLinesAbove = [...lines];
        newLinesAbove.splice(cursorRow, 0, "");
        setLines(newLinesAbove);
        setCursorCol(0);
        setMode("insert");
        setModified(true);
        setStatusMessage("-- INSERT --");
        break;
      }
      case "h":
      case "ArrowLeft":
        moveCursor(cursorRow, cursorCol - 1);
        break;
      case "l":
      case "ArrowRight":
        moveCursor(cursorRow, cursorCol + 1);
        break;
      case "j":
      case "ArrowDown":
        moveCursor(cursorRow + 1, cursorCol);
        break;
      case "k":
      case "ArrowUp":
        moveCursor(cursorRow - 1, cursorCol);
        break;
      case "0":
        setCursorCol(0);
        break;
      case "$":
        setCursorCol(Math.max(0, getCurrentLine().length - 1));
        break;
      case "x":
        if (getCurrentLine().length > 0) {
          const line = getCurrentLine();
          setCurrentLine(line.slice(0, cursorCol) + line.slice(cursorCol + 1));
          moveCursor(cursorRow, cursorCol);
        }
        break;
      case "d":
        // Simple dd implementation - delete line
        if (lines.length > 1) {
          const newLines = lines.filter((_, idx) => idx !== cursorRow);
          setLines(newLines);
          moveCursor(Math.min(cursorRow, newLines.length - 1), 0);
          setModified(true);
        } else {
          setLines([""]);
          setCursorRow(0);
          setCursorCol(0);
          setModified(true);
        }
        break;
      case ":":
        setMode("command");
        setCommandInput("");
        setStatusMessage("");
        break;
      case "g":
        // gg - go to first line
        setCursorRow(0);
        setCursorCol(0);
        break;
      case "G":
        // G - go to last line
        setCursorRow(lines.length - 1);
        setCursorCol(0);
        break;
    }
  };

  const handleInsertModeKey = (key: string, char: string | null): void => {
    if (key === "Escape") {
      setMode("normal");
      setStatusMessage("");
      moveCursor(cursorRow, Math.max(0, cursorCol - 1));
      return;
    }

    if (key === "Enter") {
      const currentLine = getCurrentLine();
      const beforeCursor = currentLine.slice(0, cursorCol);
      const afterCursor = currentLine.slice(cursorCol);

      const newLines = [...lines];
      newLines[cursorRow] = beforeCursor;
      newLines.splice(cursorRow + 1, 0, afterCursor);
      setLines(newLines);
      setCursorRow(cursorRow + 1);
      setCursorCol(0);
      setModified(true);
      return;
    }

    if (key === "Backspace") {
      if (cursorCol > 0) {
        const line = getCurrentLine();
        setCurrentLine(line.slice(0, cursorCol - 1) + line.slice(cursorCol));
        setCursorCol(cursorCol - 1);
      } else if (cursorRow > 0) {
        // Join with previous line
        const currentLine = getCurrentLine();
        const newLines = [...lines];
        const prevLine = newLines[cursorRow - 1];
        newLines[cursorRow - 1] = prevLine + currentLine;
        newLines.splice(cursorRow, 1);
        setLines(newLines);
        setCursorRow(cursorRow - 1);
        setCursorCol(prevLine.length);
        setModified(true);
      }
      return;
    }

    if (char && char.length === 1 && /^[\x20-\x7E]$/.test(char)) {
      const line = getCurrentLine();
      const newLine = line.slice(0, cursorCol) + char + line.slice(cursorCol);
      setCurrentLine(newLine);
      setCursorCol(cursorCol + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    e.preventDefault();

    if (mode === "normal") {
      handleNormalModeKey(e.key);
    } else if (mode === "insert") {
      handleInsertModeKey(e.key, e.key.length === 1 ? e.key : null);
    } else if (mode === "command") {
      if (e.key === "Escape") {
        setMode("normal");
        setCommandInput("");
        setStatusMessage("");
      } else if (e.key === "Enter") {
        executeCommand(commandInput);
        setMode("normal");
        setCommandInput("");
      } else if (e.key === "Backspace") {
        setCommandInput(commandInput.slice(0, -1));
      } else if (e.key.length === 1 && /^[\x20-\x7E]$/.test(e.key)) {
        setCommandInput(commandInput + e.key);
      }
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: VIM editor needs keyboard focus
    <div
      ref={containerRef}
      className="vim-editor"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="textbox"
      aria-label="VIM Editor"
    >
      <div className="vim-content">
        {lines.map((line, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Line indices are stable in VIM editor
          <div key={idx} className="vim-line">
            <span className="vim-line-number">{idx + 1}</span>
            <span className="vim-line-content">
              {idx === cursorRow ? (
                <>
                  {line.slice(0, cursorCol)}
                  <span className="vim-cursor">{line[cursorCol] || " "}</span>
                  {line.slice(cursorCol + 1)}
                </>
              ) : (
                line || " "
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="vim-statusline">
        <div className="vim-statusline-left">
          {modified ? "[+] " : ""}
          {filepath}
        </div>
        <div className="vim-statusline-right">
          {cursorRow + 1},{cursorCol + 1}
        </div>
      </div>
      <div className="vim-commandline">
        {mode === "command" ? <>:{commandInput}</> : statusMessage}
      </div>
    </div>
  );
};

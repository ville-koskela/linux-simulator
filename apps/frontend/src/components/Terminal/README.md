# Terminal Component

A terminal emulator component that can be run inside the FloatingWindow component.

## Features

- **Command History**: Navigate through previous commands using arrow keys (↑/↓)
- **Command Execution**: Execute commands loaded from the backend API
- **Auto-copy Selection**: Selected text is automatically copied to clipboard (Linux-style)
- **Built-in Commands**: 
  - `help` - Display available commands
  - `clear` - Clear the terminal screen
- **Auto-scroll**: Automatically scrolls to the latest output
- **Click to focus**: Click anywhere in the terminal to focus the input

## Commands

Commands are loaded dynamically from the backend API at `/commands`. Each command has:
- `name`: The command name to type
- `description`: What the command does
- `usage`: How to use the command
- `level`: The level required to unlock the command

All commands are defined centrally in `packages/shared/src/commands.ts`.

## Usage

The terminal can be opened from the Start menu in the taskbar. It will open in a new FloatingWindow that can be moved, resized, minimized, and closed.

## Adding New Commands

To add new commands:

1. Add the command name to the enum in `packages/shared/src/types/commands.ts`
2. Add the command definition to `packages/shared/src/commands.ts`
3. Add translations for the command in `apps/backend/src/translations/translations.en.ts` and `translations.fi.ts`
4. Implement the command handler in the appropriate file under `apps/frontend/src/commands/`
5. Add the case to the switch statement in `apps/frontend/src/commands/index.ts`

Example:
```typescript
// In packages/shared/src/commands.ts
{
  name: "mycommand",
  description: "My custom command",
  usage: "mycommand [args]",
  level: 1,
}

// In apps/frontend/src/commands/basic-commands.ts
export const myCommand: CommandHandler = (args: string[], context: CommandContext) => {
  context.addOutput("Command output");
};
```

## Styling

The terminal uses a dark theme with VS Code-like colors. Styles can be customized in `Terminal.css`.

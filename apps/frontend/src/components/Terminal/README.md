# Terminal Component

A terminal emulator component that can be run inside the FloatingWindow component.

## Features

- **Command History**: Navigate through previous commands using arrow keys (↑/↓)
- **Command Execution**: Execute commands defined in the JSON configuration file
- **Built-in Commands**: 
  - `help` - Display available commands
  - `clear` - Clear the terminal screen
- **Auto-scroll**: Automatically scrolls to the latest output
- **Click to focus**: Click anywhere in the terminal to focus the input

## Commands

Commands are loaded from `/src/data/terminal-commands.json`. Each command has:
- `name`: The command name to type
- `description`: What the command does
- `usage`: How to use the command
- `execute`: The internal command type to execute

### Current Available Commands

1. **echo** - Display a line of text
   - Usage: `echo [text]`
   - Example: `echo Hello World`

2. **date** - Display current date and time
   - Usage: `date`

## Usage

The terminal can be opened from the Start menu in the taskbar. It will open in a new FloatingWindow that can be moved, resized, minimized, and closed.

## Adding New Commands

To add new commands:

1. Open `/src/data/terminal-commands.json`
2. Add a new command object to the `commands` array
3. Implement the command logic in the `executeBuiltinCommand` function in `Terminal.tsx`

Example:
```json
{
  "name": "mycommand",
  "description": "My custom command",
  "usage": "mycommand [args]",
  "execute": "mycommand"
}
```

Then add the case in `executeBuiltinCommand`:
```typescript
case 'mycommand':
  // Your command logic here
  return 'Command output';
```

## Styling

The terminal uses a dark theme with VS Code-like colors. Styles can be customized in `Terminal.css`.

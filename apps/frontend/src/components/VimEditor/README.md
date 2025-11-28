# VIM Editor Component

A VIM-like text editor component that integrates with the terminal emulator.

## Features

### Modes

- **Normal Mode**: Navigate and execute commands
- **Insert Mode**: Edit text
- **Command Mode**: Execute VIM commands (`:w`, `:q`, etc.)

### Normal Mode Commands

#### Movement
- `h` / `←` - Move cursor left
- `j` / `↓` - Move cursor down
- `k` / `↑` - Move cursor up
- `l` / `→` - Move cursor right
- `0` - Move to beginning of line
- `$` - Move to end of line
- `g` - Move to first line (press twice for `gg`)
- `G` - Move to last line

#### Editing
- `i` - Enter insert mode at cursor
- `I` - Enter insert mode at beginning of line
- `a` - Enter insert mode after cursor
- `A` - Enter insert mode at end of line
- `o` - Create new line below and enter insert mode
- `O` - Create new line above and enter insert mode
- `x` - Delete character under cursor
- `d` - Delete current line (press twice for `dd`)

#### Command Mode
- `:` - Enter command mode

### Insert Mode

- Type normally to insert text
- `Enter` - Create new line
- `Backspace` - Delete character before cursor
- `Esc` - Return to normal mode

### Command Mode

- `:w` - Save file
- `:q` - Quit (only if no unsaved changes)
- `:q!` - Quit without saving
- `:wq` or `:x` - Save and quit

## Usage

```tsx
import { VimEditor } from '../components/VimEditor';

<VimEditor
  filepath="/path/to/file.txt"
  initialContent="Hello, world!"
  onClose={() => console.log('Editor closed')}
/>
```

## Terminal Integration

The editor is opened via the `vim` or `vi` command in the terminal:

```bash
$ vim myfile.txt
$ vi newfile.txt
```

## Styling

The editor uses a dark theme with:
- Line numbers on the left
- Cursor highlighting
- Status line showing file path and cursor position
- Command line at the bottom

# Terminal Commands

This directory contains the command handlers for the terminal emulator.

## Architecture

Commands are now modular and separated from the Terminal component:

- **types.ts** - Defines `CommandHandler` interface and `CommandContext`
- **basic-commands.ts** - Simple commands (echo, date, pwd)
- **filesystem-commands.ts** - Filesystem operations (ls, cd, cat, mkdir, touch, rm, mv)
- **index.ts** - Central registry of all command handlers

## Adding New Commands

1. **Backend**: Add command metadata to `/apps/backend/src/commands/commands.controller.ts`
2. **Frontend**: Create handler function:

```typescript
export const myCommand: CommandHandler = (args, context) => {
  // Validate args
  if (args.length === 0) {
    context.addOutput("mycommand: missing operand", "error");
    return;
  }

  // Execute logic
  const result = someLogic(args[0]);
  
  // Output result
  context.addOutput(result);
};
```

3. **Register**: Add to `commandHandlers` in `index.ts`

## Command Context

Each handler receives:
- `args: string[]` - Command arguments
- `context: CommandContext` - Object with:
  - `currentPath` - Current working directory
  - `currentNode` - Current filesystem node
  - `addOutput(content, type?)` - Add output to terminal
  - `setCurrentPath(path)` - Update current path
  - `setCurrentNode(node)` - Update current node
  - `resolvePath(path)` - Resolve relative paths

## Benefits

- **Maintainability**: Each command is isolated in its own function
- **Testability**: Commands can be unit tested independently
- **Scalability**: Easy to add new commands without modifying Terminal component
- **Type Safety**: Full TypeScript support with shared types
- **API-Driven**: Command metadata comes from backend API

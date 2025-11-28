# Linux Simulator

A web-based Linux terminal simulator for teaching basic Linux commands and filesystem concepts. Built with React + TypeScript frontend and NestJS backend with PostgreSQL.

## Tech Stack

**Frontend:**
- React 19 + TypeScript + Vite
- Biome (linting/formatting)
- Node.js Test Runner + React Testing Library

**Backend:**
- NestJS + TypeScript
- PostgreSQL with raw SQL (no ORM)
- Custom migration system

**Dev Tools:**
- Husky (git hooks)
- Commitlint (conventional commits)
- Monorepo structure (npm workspaces)

## Prerequisites

- Node.js 24.9.0 (managed via asdf)
- npm (comes with Node.js)

### asdf Setup

```bash
# Install Node.js plugin for asdf
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git

## Getting Started

```bash
# Install dependencies
npm install

# Start frontend only
npm run dev:frontend

# Start backend only  
npm run dev:backend

# Start both (backend + frontend)
npm run dev:all

# Run tests
npm test

# Build production
npm run build
``` run type-check

# Build for production
npm run build

## Code Quality

```bash
# Lint
npm run lint        # check
npm run lint:fix    # fix

# Format
npm run format      # fix formatting

# All checks
npm run check       # check all
npm run check:fix   # fix all
``` run check

# Fix all issues (lint + format)
npm run check:fix
```

## Testing

This project uses Node.js's built-in test runner with React Testing Library:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Structure

Tests are located in `tests/` (root level) and use:
- `node:test` - Built-in test runner
- `node:assert` (strict mode) - Assertions
## Coding Standards

**TypeScript:**
- ✅ Always use named exports (`export const Component`)
- ✅ Never use default exports
- ✅ Use `FC<PropsType>` for React components
- ✅ Explicit prop interfaces
- ✅ Inline default values in destructuring

**Testing:**
- Use Node.js built-in test runner
- Always call `createDOM()` in `beforeEach()`
- Use strict assertions from `node:assert`
- Access elements from `render()` return, not `screen`

**Git:**
- Conventional commits required (enforced by git hooks)
- Pre-commit runs linting/formatting
- Use exact dependency versions (no `^` or `~`)feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style/formatting changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI configuration changes
- `chore` - Other maintenance tasks
- `revert` - Revert a previous commit

**Examples:**

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve navigation overflow issue"
git commit -m "docs: update README with testing instructions"
git commit -m "test: add unit tests for Button component"
```

### Git Hooks

- **pre-commit**: Runs `npm run check` (Biome linting + formatting)
VS Code Integration

The project includes `.vscode/settings.json` for automatic code formatting and import organization on save using Biome.

**Recommended VS Code Extension:**
- [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)

## Configuration Files

- **biome.json** - Code linting and formatting rules
- **tsconfig.json** - TypeScript compiler options
- **vite.config.ts** - Vite build configuration
- **commitlint.config.js** - Commit message validation rules
- **.tool-versions** - Node.js version for asdf

## 📚 Documentation

Comprehensive technical documentation is available in the [`.docs/`](.docs/) directory:

- **[Documentation Index](.docs/README.md)** - Complete guide to all documentation
- **[Component Creation Guide](.docs/AI_COMPONENT_CREATION_GUIDE.md)** - Standards for creating React components
- **[Testing Guide](.docs/COMPONENT_TESTING_GUIDE.md)** - Testing practices and examples
- **[Backend Architecture](.docs/BACKEND_ARCHITECTURE.md)** - NestJS backend structure
- **[Quick Reference](.docs/QUICK_REFERENCE.md)** - Common commands and patterns

See [.docs/README.md](.docs/README.md) for the full documentation index.

## License

Private project - not licensed for public use.
## Project Structure

```
apps/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── utils/
│   └── tests/
└── backend/           # NestJS API
    └── src/
        ├── config/
        ├── database/
        ├── filesystem/
        └── logger/

packages/
└── shared/            # Shared TypeScript types
    └── src/types/

.docs/                 # Backend architecture docs
├── BACKEND_ARCHITECTURE.md
├── MIGRATIONS.md
└── REPOSITORY_PATTERN.md
```

## Backend Documentation

Backend uses NestJS with PostgreSQL and raw SQL (no ORM). See:
- [Backend Architecture](.docs/BACKEND_ARCHITECTURE.md)
- [Migrations](.docs/MIGRATIONS.md)  
- [Repository Pattern](.docs/REPOSITORY_PATTERN.md)
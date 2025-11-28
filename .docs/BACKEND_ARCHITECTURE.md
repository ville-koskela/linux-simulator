# Backend Architecture Guide

## Overview

The Linux Simulator backend is built with **NestJS** and **PostgreSQL**, designed to provide a virtual filesystem for teaching Linux basics with gamification features.

## Technology Decisions

### Framework: NestJS
- **Why**: Modular architecture, TypeScript native, excellent for structured APIs
- **Version**: 11.x (exact versions locked in package.json)

### Database: PostgreSQL with Raw SQL
- **Why**: We prefer raw SQL over ORMs for transparency and control
- **Driver**: `pg` (node-postgres)
- **Philosophy**: "You end up writing queries by hand sooner or later - better sooner than later"

### No ORM
- Direct SQL queries using `pg`
- Database service wrapper for query execution and transactions
- Manual migrations via SQL files

## Project Structure

```
apps/backend/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   ├── database/
│   │   ├── database.module.ts       # Global database module
│   │   ├── database.service.ts      # Query execution & transactions
│   │   ├── schema.sql               # Database schema & seed data
│   │   └── migrations.ts            # Migration runner
│   └── filesystem/
│       ├── filesystem.module.ts     # Filesystem feature module
│       ├── filesystem.controller.ts # REST endpoints
│       ├── filesystem.service.ts    # Business logic with raw SQL
│       └── filesystem.types.ts      # Module-specific types
├── .env                             # Environment variables (gitignored)
├── .env.example                     # Environment template
├── package.json                     # Exact version dependencies
└── tsconfig.json                    # TypeScript config

packages/shared/
└── src/
    └── types/
        ├── filesystem.ts            # Shared API contracts
        └── settings.ts              # Shared settings types
```

## Core Principles

### 1. Exact Dependency Versions
All dependencies use exact versions (no `^` or `~`) for production predictability:
```json
{
  "@nestjs/core": "11.0.6",  // ✅ Exact
  "pg": "8.13.1"             // ✅ Exact
}
```

### 2. Raw SQL Queries
Use the `DatabaseService` for all queries:
```typescript
// ✅ Good
await this.db.query<User>(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ❌ Avoid ORMs
```

### 3. Shared Types
API contracts live in `packages/shared/src/types/`:
- Frontend and backend import from `@linux-simulator/shared`
- Ensures type safety across the monorepo

### 4. Module Organization
Each feature is a self-contained module:
- `*.module.ts` - Module definition
- `*.controller.ts` - REST endpoints
- `*.service.ts` - Business logic with SQL
- `*.types.ts` - Module-specific types

## Current Implementation Status

### ✅ Completed
- [x] Filesystem API with full CRUD operations
- [x] PostgreSQL schema with auto-migrations
- [x] Hardcoded demo user (ID: 1)
- [x] Database service with transaction support

### 🚧 Planned Features
- [ ] User authentication (JWT)
- [ ] Exercise/task system
- [ ] XP and leveling system
- [ ] User progress tracking
- [ ] Achievement system
- [ ] User settings persistence

## Database Schema

### Current Tables

**users**
```sql
id SERIAL PRIMARY KEY
username VARCHAR(255) UNIQUE
email VARCHAR(255) UNIQUE
created_at TIMESTAMP
updated_at TIMESTAMP
```

**filesystem_nodes**
```sql
id SERIAL PRIMARY KEY
user_id INTEGER -> users(id)
parent_id INTEGER -> filesystem_nodes(id) (NULL for root)
name VARCHAR(255)
type VARCHAR(10) CHECK ('file', 'directory')
content TEXT (NULL for directories)
permissions VARCHAR(10) (e.g., 'rwxr-xr-x')
created_at TIMESTAMP
updated_at TIMESTAMP
UNIQUE(user_id, parent_id, name)
```

### Future Tables (Gamification)
```sql
-- Exercise definitions
exercises
  id, title, description, difficulty, xp_reward, unlock_level, category

-- User progress tracking  
user_progress
  id, user_id, exercise_id, completed_at, time_taken

-- User stats
user_stats
  id, user_id, total_xp, level, achievements

-- Settings storage
user_settings
  id, user_id, language, theme, preferences (JSONB)
```

## API Design

### Naming Convention
- RESTful endpoints: `/resource/action`
- Use query params for filters: `?nodeId=5`
- Use body for complex data

### Current Endpoints

**Filesystem**
- `GET /filesystem/tree?nodeId={id}` - Get tree (default: root)
- `GET /filesystem/node/:id` - Get node by ID
- `GET /filesystem/path?path={path}` - Get node by path
- `GET /filesystem/children?parentId={id}` - List children
- `POST /filesystem/node` - Create file/directory
- `PUT /filesystem/node/:id` - Update node
- `DELETE /filesystem/node/:id` - Delete node
- `PUT /filesystem/node/:id/move` - Move node

### Hardcoded User (Development Phase)
- **User ID**: 1
- **Username**: demo
- **Email**: demo@linux-simulator.local
- All controllers currently use `DEFAULT_USER_ID = 1`

## Development Workflow

### Starting the Backend
```bash
cd apps/backend
npm run dev
```

### Migrations
- Auto-run on application startup via `main.ts`
- Schema defined in `src/database/schema.sql`
- Migrations are idempotent (use `CREATE IF NOT EXISTS`, `ON CONFLICT`)

### Adding New Features
1. Create module folder in `src/`
2. Define types (both in module and `packages/shared/src/types/`)
3. Create service with raw SQL queries
4. Create controller with REST endpoints
5. Import module in `app.module.ts`

### Database Queries Pattern
```typescript
// Simple query
const result = await this.db.query<MyType>(
  'SELECT * FROM table WHERE id = $1',
  [id]
);

// Transaction
await this.db.transaction(async (client) => {
  await client.query('INSERT INTO table1 ...');
  await client.query('INSERT INTO table2 ...');
});
```

## Environment Variables

Required in `.env`:
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=linux_simulator
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

PORT=3001
NODE_ENV=development

# For development
DEFAULT_USER_ID=1
CORS_ORIGIN=http://localhost:5173
```

## Gamification Design (Future)

### Progression System
- Users earn XP by completing exercises
- Levels unlock new features and harder exercises
- Achievements for milestones

### Exercise Types
- Command execution (validate output)
- File manipulation (create/edit/delete)
- Permission management
- Navigation challenges
- Script writing

### XP Formula (Proposed)
```
XP = base_difficulty * time_factor * streak_multiplier
```

## Code Style

### TypeScript
- Strict mode enabled
- No `any` types (use proper typing)
- Prefer interfaces over types for objects

### NestJS Patterns
- Use decorators: `@Injectable()`, `@Controller()`, `@Get()`
- Dependency injection via constructor
- Global modules for shared services (e.g., DatabaseModule)

### SQL
- Use parameterized queries: `$1, $2, ...`
- Always handle NULL cases
- Use transactions for multi-step operations
- Add indexes for frequently queried columns

## Security Considerations (Future)

When implementing authentication:
- JWT tokens with short expiration
- Refresh token rotation
- User isolation via `user_id` in all queries
- Rate limiting on expensive operations
- Input validation with NestJS ValidationPipe

## Testing Strategy (Future)

- Unit tests for services (mock DatabaseService)
- Integration tests with test database
- E2E tests for critical user flows
- SQL query tests for performance

## Reference for AI Coding Sessions

When working on this codebase:
1. ✅ Always use exact versions for new dependencies
2. ✅ Write raw SQL queries, never suggest ORMs
3. ✅ Put shared types in `packages/shared/src/types/`
4. ✅ Follow NestJS module pattern
5. ✅ Use hardcoded `DEFAULT_USER_ID = 1` for now
6. ✅ Make migrations idempotent
7. ✅ Use DatabaseService for all queries
8. ✅ Enable CORS for frontend (port 5173)

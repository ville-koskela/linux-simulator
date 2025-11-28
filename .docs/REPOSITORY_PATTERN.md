# Repository Pattern

## Overview

The backend uses the **Repository Pattern** to isolate all SQL queries within the database module. This creates a clean separation between data access and business logic.

## Architecture Layers

```
Controller → Service (Business Logic) → Repository (Data Access) → DatabaseService (SQL Execution)
```

### Layer Responsibilities

1. **Controller**: HTTP request/response handling, validation
2. **Service**: Business logic, validation, orchestration
3. **Repository**: CRUD operations, SQL queries
4. **DatabaseService**: Connection pooling, transaction management

## Directory Structure

```
src/
├── database/
│   ├── database.service.ts        # Low-level SQL execution
│   ├── database.module.ts         # Exports repositories
│   ├── migrations.ts              # Migration runner
│   ├── migrations/                # SQL migration files
│   └── repositories/              # Domain repositories
│       ├── index.ts
│       └── filesystem.repository.ts
├── filesystem/
│   ├── filesystem.service.ts      # Business logic (NO SQL)
│   ├── filesystem.controller.ts   # HTTP endpoints
│   └── filesystem.types.ts        # Domain types
```

## Key Principles

### ✅ DO

- **Keep SQL in repositories only**
  ```typescript
  // ✅ Good - Repository handles SQL
  class FilesystemRepository {
    async findById(userId: number, id: number): Promise<FilesystemNode | null> {
      const result = await this.db.query<FilesystemNode>(
        "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND id = $2",
        [userId, id]
      );
      return result.rows[0] || null;
    }
  }
  ```

- **Use repositories in services**
  ```typescript
  // ✅ Good - Service uses repository methods
  class FilesystemService {
    async getNodeById(userId: number, id: number) {
      return this.repository.findById(userId, id);
    }
  }
  ```

- **Add business logic in services**
  ```typescript
  // ✅ Good - Validation and orchestration in service
  async createNode(userId: number, dto: CreateNodeDto) {
    // Business validation
    if (dto.parentId !== null) {
      const parent = await this.repository.findById(userId, dto.parentId);
      if (!parent) {
        throw new NotFoundException("Parent not found");
      }
      if (parent.type !== "directory") {
        throw new BadRequestException("Parent must be a directory");
      }
    }
    
    // Delegate to repository
    return this.repository.create(userId, dto);
  }
  ```

### ❌ DON'T

- **Don't write SQL in services**
  ```typescript
  // ❌ Bad - SQL in service layer
  class FilesystemService {
    async getNodeById(userId: number, id: number) {
      const result = await this.db.query("SELECT * FROM ...");
      return result.rows[0];
    }
  }
  ```

- **Don't put business logic in repositories**
  ```typescript
  // ❌ Bad - Repository shouldn't validate business rules
  class FilesystemRepository {
    async create(userId: number, dto: CreateNodeDto) {
      if (dto.parentId !== null) {
        // This validation belongs in the service!
        const parent = await this.findById(userId, dto.parentId);
        if (!parent) throw new NotFoundException();
      }
      // ...
    }
  }
  ```

- **Don't access repositories from controllers**
  ```typescript
  // ❌ Bad - Controller bypassing service layer
  class FilesystemController {
    @Get(":id")
    async getNode(@Param("id") id: number) {
      return this.repository.findById(1, id); // Skip service!
    }
  }
  ```

## Repository Methods Naming Convention

Use standard CRUD naming:

- `findById()` - Get single entity by ID
- `findByPath()` - Get single entity by path
- `findChildren()` - Get multiple entities
- `exists()` - Check existence (returns boolean)
- `create()` - Insert new entity
- `update()` - Modify existing entity
- `delete()` - Remove entity
- `move()` - Special operation for filesystem

## Adding a New Repository

### Step 1: Create Repository File

```typescript
// src/database/repositories/user.repository.ts
import { Injectable } from "@nestjs/common";
import type { DatabaseService } from "../database.service";
import type { User } from "../../users/user.types";

@Injectable()
export class UserRepository {
  constructor(private db: DatabaseService) {}

  async findById(id: number): Promise<User | null> {
    const result = await this.db.query<User>(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  async create(username: string, email: string): Promise<User> {
    const result = await this.db.query<User>(
      "INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *",
      [username, email]
    );
    return result.rows[0];
  }

  // Add more methods...
}
```

### Step 2: Export from Index

```typescript
// src/database/repositories/index.ts
export { FilesystemRepository } from "./filesystem.repository";
export { UserRepository } from "./user.repository";
```

### Step 3: Register in DatabaseModule

```typescript
// src/database/database.module.ts
import { UserRepository } from "./repositories";

@Global()
@Module({
  providers: [DatabaseService, FilesystemRepository, UserRepository],
  exports: [DatabaseService, FilesystemRepository, UserRepository],
})
export class DatabaseModule {}
```

### Step 4: Use in Service

```typescript
// src/users/users.service.ts
import { UserRepository } from "../database/repositories";

@Injectable()
export class UsersService {
  constructor(private repository: UserRepository) {}

  async getUserById(id: number) {
    return this.repository.findById(id);
  }
}
```

## Benefits

### 🎯 Separation of Concerns
- Business logic stays in services (what to do)
- Data access stays in repositories (how to get data)
- SQL queries isolated in one place

### 🧪 Testability
- Mock repositories easily in service tests
- Test SQL queries in isolation in repository tests
- No need to mock database in service tests

### 🔄 Maintainability
- Change database queries without touching business logic
- Database schema changes only affect repositories
- Easy to add caching or query optimization

### 🔍 Discoverability
- All database operations visible in repository interface
- Type-safe method signatures
- Clear contract between layers

## Advanced Patterns

### Transactions in Services

When you need to perform multiple operations atomically:

```typescript
async moveNode(userId: number, nodeId: number, newParentId: number) {
  // Use repository's transaction method
  return this.repository.transaction(async (client) => {
    // All queries in this callback use the same transaction
    const node = await this.repository.findById(userId, nodeId);
    if (!node) throw new NotFoundException();
    
    await this.repository.move(userId, nodeId, newParentId);
    await this.auditRepository.logMove(userId, nodeId, newParentId);
    
    return node;
  });
}
```

### Complex Queries

For complex queries (joins, aggregations), add dedicated repository methods:

```typescript
async getFilesystemStats(userId: number): Promise<Stats> {
  const result = await this.db.query<Stats>(
    `SELECT 
       COUNT(*) FILTER (WHERE type = 'file') as file_count,
       COUNT(*) FILTER (WHERE type = 'directory') as dir_count,
       SUM(LENGTH(content)) as total_size
     FROM filesystem_nodes 
     WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}
```

## Migration to Repository Pattern

If you have existing code with SQL in services:

1. Create repository with equivalent methods
2. Register repository in DatabaseModule
3. Inject repository into service
4. Replace `this.db.query(...)` with `this.repository.method(...)`
5. Remove DatabaseService injection from service
6. Verify tests still pass

## Summary

**Rule of thumb**: If you see `this.db.query()` anywhere except in a repository, it should be refactored.

Repositories create a **clean, maintainable, and testable** architecture by keeping all SQL queries in one place while services focus on business logic.

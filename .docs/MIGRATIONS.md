# Database Migrations

## Overview

This project uses a simple, file-based migration system without external dependencies. Migrations are SQL files stored in `apps/backend/src/database/migrations/` that run automatically on application startup.

## How It Works

1. **Migration Tracking**: A `migrations` table tracks which migrations have been executed
2. **Automatic Discovery**: All `.sql` files in the migrations directory are discovered on startup
3. **Ordered Execution**: Files are executed in numeric order based on their filename prefix
4. **Idempotent**: Already executed migrations are skipped
5. **Transactional**: Each migration runs in a transaction - if it fails, it rolls back

## Migration File Naming Convention

Use numeric prefixes to control execution order:

```
1_create_users_table.sql
2_create_filesystem_table.sql
3_seed_filesystem.sql
4_add_user_roles.sql
```

The number before the first underscore determines the execution order.

## Creating a New Migration

1. Create a new `.sql` file in `apps/backend/src/database/migrations/`
2. Name it with the next sequential number: `N_descriptive_name.sql`
3. Write your SQL statements in the file
4. The migration will run automatically on next application startup

Example: `apps/backend/src/database/migrations/4_add_user_roles.sql`

```sql
-- Add roles column to users table
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- Create index for role lookups
CREATE INDEX idx_users_role ON users(role);
```

## SQL Guidelines

### Column Types

**Always use `TEXT` instead of `VARCHAR`:**

- ❌ Bad: `name VARCHAR(255)`
- ✅ Good: `name TEXT`

**Rationale:**
- PostgreSQL stores both `TEXT` and `VARCHAR` identically (no performance difference)
- `TEXT` is more flexible - no arbitrary length limits
- Simpler schema - one less decision to make
- If you need length validation, do it at application level with Zod/class-validator

**Exceptions:**
- Fixed-length codes where the constraint is meaningful: `country_code CHAR(2)`
- But even then, `TEXT` with a CHECK constraint is often better

### Other Best Practices

1. **Always use `IF NOT EXISTS` for idempotency:**
   ```sql
   CREATE TABLE IF NOT EXISTS table_name (...);
   CREATE INDEX IF NOT EXISTS idx_name ON table (...);
   ```

2. **Use `ON CONFLICT DO NOTHING` for seed data:**
   ```sql
   INSERT INTO users (id, username, email)
   VALUES (1, 'demo', 'demo@example.com')
   ON CONFLICT (id) DO NOTHING;
   ```

3. **Add indexes for foreign keys and common queries:**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_filesystem_user_id ON filesystem_nodes(user_id);
   ```

4. **Use `TIMESTAMP WITH TIME ZONE` for timestamps:**
   ```sql
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   ```

5. **Use constraints for data integrity:**
   ```sql
   type TEXT NOT NULL CHECK (type IN ('file', 'directory'))
   ```

## Migration Execution Log

When the application starts, you'll see migration logs:

```
[Bootstrap] Running database migrations...
[Bootstrap] Executing migration: 1_create_users_table.sql
[Bootstrap] ✓ Migration executed: 1_create_users_table.sql
[Bootstrap] Executing migration: 2_create_filesystem_table.sql
[Bootstrap] ✓ Migration executed: 2_create_filesystem_table.sql
[Bootstrap] Database migrations completed successfully (2 executed)
```

Already executed migrations are skipped:

```
[Bootstrap] Running database migrations...
[Bootstrap] Skipping already executed migration: 1_create_users_table.sql
[Bootstrap] Skipping already executed migration: 2_create_filesystem_table.sql
[Bootstrap] No pending migrations
```

## Troubleshooting

### Migration Failed

If a migration fails:
1. Check the error message in console logs
2. Fix the SQL in the migration file
3. Manually delete the failed migration record from the database:
   ```sql
   DELETE FROM migrations WHERE filename = 'N_problematic_migration.sql';
   ```
4. Restart the application - it will retry the migration

### Reset All Migrations (Development Only)

To start fresh in development:

```sql
DROP TABLE migrations CASCADE;
```

Then restart the application - all migrations will run again.

⚠️ **Never do this in production!** You'll lose track of what's been executed.

## Rollback Strategy

This migration system does not support automatic rollbacks. To rollback:

1. Create a new migration that undoes the changes
2. Example: If `5_add_column.sql` added a column, create `6_remove_column.sql`

This approach:
- Maintains full history
- Works in production where multiple instances may be running
- Makes the migration history auditable

## Future Enhancements

Possible improvements if needed:
- [ ] Add `down` migrations for rollbacks
- [ ] Add migration checksums to detect modifications
- [ ] Add dry-run mode
- [ ] Add migration status CLI command

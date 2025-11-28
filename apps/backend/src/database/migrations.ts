import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { LoggerService } from "../logger/logger.service";
import type { DatabaseService } from "./database.service";

interface Migration {
  id: number;
  filename: string;
  executed_at: Date;
}

export async function runMigrations(
  db: DatabaseService,
  logger: LoggerService
): Promise<void> {
  logger.log("Running database migrations...");

  // Create migrations tracking table if it doesn't exist
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Get list of executed migrations
  const executedMigrations = await db.query<Migration>(
    "SELECT filename FROM migrations ORDER BY id"
  );
  const executedFilenames = new Set(
    executedMigrations.rows.map((m) => m.filename)
  );

  // Read migration files from migrations directory
  const migrationsDir = path.join(__dirname, "migrations");
  let files: string[];
  try {
    files = await fs.readdir(migrationsDir);
  } catch (error) {
    logger.error(
      "Failed to read migrations directory",
      error instanceof Error ? error.stack : String(error)
    );
    throw error;
  }

  // Filter and sort SQL files
  const migrationFiles = files
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => {
      // Extract numeric prefix for sorting (e.g., "1_" from "1_create_users.sql")
      const aNum = Number.parseInt(a.split("_")[0], 10);
      const bNum = Number.parseInt(b.split("_")[0], 10);
      return aNum - bNum;
    });

  // Run pending migrations
  let executedCount = 0;
  for (const filename of migrationFiles) {
    if (executedFilenames.has(filename)) {
      logger.debug(`Skipping already executed migration: ${filename}`);
      continue;
    }

    logger.log(`Executing migration: ${filename}`);
    const migrationPath = path.join(migrationsDir, filename);
    const sql = await fs.readFile(migrationPath, "utf-8");

    try {
      // Execute migration in a transaction
      await db.transaction(async (client) => {
        // Run the migration SQL
        await client.query(sql);
        // Record the migration
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
          filename,
        ]);
      });

      logger.log(`✓ Migration executed: ${filename}`);
      executedCount++;
    } catch (error) {
      logger.error(
        `Migration failed: ${filename}`,
        error instanceof Error ? error.stack : String(error)
      );
      throw error;
    }
  }

  if (executedCount === 0) {
    logger.log("No pending migrations");
  } else {
    logger.log(
      `Database migrations completed successfully (${executedCount} executed)`
    );
  }
}

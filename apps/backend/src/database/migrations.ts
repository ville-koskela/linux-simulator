import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { DatabaseService } from './database.service';
import type { LoggerService } from '../logger/logger.service';

export async function runMigrations(
  db: DatabaseService,
  logger: LoggerService
): Promise<void> {
  logger.log('Running database migrations...');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf-8');

  try {
    await db.query(schema);
    logger.log('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', error instanceof Error ? error.stack : String(error));
    throw error;
  }
}

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { DatabaseService } from './database.service';

export async function runMigrations(db: DatabaseService): Promise<void> {
  console.log('Running database migrations...');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf-8');

  try {
    await db.query(schema);
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

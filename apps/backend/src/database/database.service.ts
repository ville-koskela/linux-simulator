import { Injectable } from "@nestjs/common";
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
// biome-ignore lint/style/useImportType: <Needed by dependency injection>
import { ConfigService } from "../config/config.service";
// biome-ignore lint/style/useImportType: <Needed by dependency injection>
import { LoggerService } from "../logger/logger.service";

@Injectable()
export class DatabaseService {
  private pool: Pool;
  private logger: LoggerService;
  private config: ConfigService;

  constructor(logger: LoggerService, config: ConfigService) {
    this.config = config;
    this.logger = logger;
    this.logger.setContext("DatabaseService");
    this.pool = new Pool({
      host: config.databaseHost,
      port: config.databasePort,
      database: config.databaseName,
      user: config.databaseUser,
      password: config.databasePassword,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    const result = await this.pool.query<T>(text, params);
    const duration = Date.now() - start;

    if (this.config.isDevelopment) {
      this.logger.debug(`Query executed in ${duration}ms - ${result.rowCount} rows`);
    }

    return result;
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

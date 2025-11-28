import { Injectable } from "@nestjs/common";
import { z } from "zod";

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),

  // Database
  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_NAME: z.string().default("linux_simulator"),
  DATABASE_USER: z.string().default("postgres"),
  DATABASE_PASSWORD: z.string().default("postgres"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),

  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Application
  DEFAULT_USER_ID: z.coerce.number().int().positive().default(1),
});

export type EnvConfig = z.infer<typeof envSchema>;

@Injectable()
export class ConfigService {
  private readonly config: EnvConfig;

  constructor() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      // biome-ignore lint/suspicious/noConsole: Config validation errors must be logged before app starts
      console.error("❌ Invalid environment configuration:");
      // biome-ignore lint/suspicious/noConsole: Config validation errors must be logged before app starts
      console.error(result.error.format());
      throw new Error("Environment validation failed");
    }

    this.config = result.data;
  }

  get nodeEnv(): string {
    return this.config.NODE_ENV;
  }

  get port(): number {
    return this.config.PORT;
  }

  get isProduction(): boolean {
    return this.config.NODE_ENV === "production";
  }

  get isDevelopment(): boolean {
    return this.config.NODE_ENV === "development";
  }

  get isTest(): boolean {
    return this.config.NODE_ENV === "test";
  }

  // Database
  get databaseHost(): string {
    return this.config.DATABASE_HOST;
  }

  get databasePort(): number {
    return this.config.DATABASE_PORT;
  }

  get databaseName(): string {
    return this.config.DATABASE_NAME;
  }

  get databaseUser(): string {
    return this.config.DATABASE_USER;
  }

  get databasePassword(): string {
    return this.config.DATABASE_PASSWORD;
  }

  // Logging
  get logLevel(): string {
    return this.config.LOG_LEVEL;
  }

  // CORS
  get corsOrigin(): string {
    return this.config.CORS_ORIGIN;
  }

  // Application
  get defaultUserId(): number {
    return this.config.DEFAULT_USER_ID;
  }
}

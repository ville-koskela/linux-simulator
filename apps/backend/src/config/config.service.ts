import { Injectable } from "@nestjs/common";
import { z } from "zod";

const envSchema: z.ZodObject<{
  NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
  PORT: z.ZodDefault<z.ZodNumber>;
  DATABASE_HOST: z.ZodDefault<z.ZodString>;
  DATABASE_PORT: z.ZodDefault<z.ZodNumber>;
  DATABASE_NAME: z.ZodDefault<z.ZodString>;
  DATABASE_USER: z.ZodDefault<z.ZodString>;
  DATABASE_PASSWORD: z.ZodDefault<z.ZodString>;
  LOG_LEVEL: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
  CORS_ORIGIN: z.ZodDefault<z.ZodString>;
  DEFAULT_USER_ID: z.ZodDefault<z.ZodNumber>;
}> = z.object({
  // Server
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
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

  public constructor() {
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

  public get nodeEnv(): string {
    return this.config.NODE_ENV;
  }

  public get port(): number {
    return this.config.PORT;
  }

  public get isProduction(): boolean {
    return this.config.NODE_ENV === "production";
  }

  public get isDevelopment(): boolean {
    return this.config.NODE_ENV === "development";
  }

  public get isTest(): boolean {
    return this.config.NODE_ENV === "test";
  }

  // Database
  public get databaseHost(): string {
    return this.config.DATABASE_HOST;
  }

  public get databasePort(): number {
    return this.config.DATABASE_PORT;
  }

  public get databaseName(): string {
    return this.config.DATABASE_NAME;
  }

  public get databaseUser(): string {
    return this.config.DATABASE_USER;
  }

  public get databasePassword(): string {
    return this.config.DATABASE_PASSWORD;
  }

  // Logging
  public get logLevel(): string {
    return this.config.LOG_LEVEL;
  }

  // CORS
  public get corsOrigin(): string {
    return this.config.CORS_ORIGIN;
  }

  // Application
  public get defaultUserId(): number {
    return this.config.DEFAULT_USER_ID;
  }
}

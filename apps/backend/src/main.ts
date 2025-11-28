import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import { AppModule } from "./app.module";
import { ConfigService } from "./config/config.service";
import { DatabaseService } from "./database/database.service";
import { runMigrations } from "./database/migrations";
import { LoggerService } from "./logger/logger.service";

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);
  logger.setContext("Bootstrap");
  app.useLogger(logger);

  // Enable CORS for frontend
  app.enableCors({
    origin: config.corsOrigin,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Run migrations on startup
  const db = app.get(DatabaseService);

  try {
    await runMigrations(db, logger);
  } catch (error) {
    logger.error(
      "Failed to run migrations",
      error instanceof Error ? error.stack : String(error)
    );
    process.exit(1);
  }

  await app.listen(config.port);

  logger.log(`🚀 Backend server running on http://localhost:${config.port}`);
}

bootstrap();

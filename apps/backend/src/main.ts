import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
import { LoggerService } from './logger/logger.service';
import { runMigrations } from './database/migrations';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService('NestApplication'),
  });

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
  const logger = app.get(LoggerService);
  logger.setContext('Bootstrap');

  try {
    await runMigrations(db, logger);
  } catch (error) {
    logger.error(
      'Failed to run migrations',
      error instanceof Error ? error.stack : String(error)
    );
    process.exit(1);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Backend server running on http://localhost:${port}`);
}

bootstrap();

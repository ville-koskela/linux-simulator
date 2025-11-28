import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { FilesystemModule } from './filesystem/filesystem.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [ConfigModule, LoggerModule, DatabaseModule, FilesystemModule],
})
export class AppModule {}

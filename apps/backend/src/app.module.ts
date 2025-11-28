import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { FilesystemModule } from './filesystem/filesystem.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [LoggerModule, DatabaseModule, FilesystemModule],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { FilesystemModule } from './filesystem/filesystem.module';

@Module({
  imports: [DatabaseModule, FilesystemModule],
})
export class AppModule {}

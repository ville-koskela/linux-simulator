import { Module } from "@nestjs/common";
import { CommandsModule } from "./commands/commands.module";
import { ConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { FilesystemModule } from "./filesystem/filesystem.module";
import { HealthController } from "./health/health.controller";
import { LoggerModule } from "./logger/logger.module";
import { TranslationsModule } from "./translations/translations.module";

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    FilesystemModule,
    CommandsModule,
    TranslationsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

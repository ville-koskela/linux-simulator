import { Global, Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { FilesystemRepository } from "./repositories";

@Global()
@Module({
  providers: [DatabaseService, FilesystemRepository],
  exports: [DatabaseService, FilesystemRepository],
})
export class DatabaseModule {}

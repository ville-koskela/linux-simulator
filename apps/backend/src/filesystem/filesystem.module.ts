import { Module } from "@nestjs/common";
import { FilesystemRepository } from "../database/repositories";
import { FilesystemController } from "./filesystem.controller";
import { FilesystemService } from "./filesystem.service";

@Module({
  controllers: [FilesystemController],
  providers: [FilesystemService, FilesystemRepository],
  exports: [FilesystemService],
})
export class FilesystemModule {}

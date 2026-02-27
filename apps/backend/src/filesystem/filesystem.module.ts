import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { FilesystemRepository } from "../database/repositories";
import { FilesystemController } from "./filesystem.controller";
import { FilesystemService } from "./filesystem.service";

@Module({
  imports: [AuthModule],
  controllers: [FilesystemController],
  providers: [FilesystemService, FilesystemRepository],
  exports: [FilesystemService],
})
export class FilesystemModule {}

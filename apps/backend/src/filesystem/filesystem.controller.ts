import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: <Needed by dependency injection>
import { FilesystemService } from "./filesystem.service";
// biome-ignore lint/style/useImportType: <Needed by dependency injection>
import { CreateNodeDto, UpdateNodeDto } from "./filesystem.types";

@Controller("filesystem")
export class FilesystemController {
  // Hardcoded user ID for now
  private readonly DEFAULT_USER_ID = 1;

  constructor(private filesystemService: FilesystemService) {}

  @Get("tree")
  async getTree(@Query("nodeId") nodeId?: string) {
    const id = nodeId ? parseInt(nodeId, 10) : undefined;
    return this.filesystemService.getTree(this.DEFAULT_USER_ID, id);
  }

  @Get("node/:id")
  async getNode(@Param("id", ParseIntPipe) id: number) {
    return this.filesystemService.getNodeById(this.DEFAULT_USER_ID, id);
  }

  @Get("path")
  async getNodeByPath(@Query("path") path: string) {
    if (!path) {
      path = "/";
    }
    return this.filesystemService.getNodeByPath(this.DEFAULT_USER_ID, path);
  }

  @Get("children")
  async getChildren(@Query("parentId") parentId?: string) {
    const id = parentId ? parseInt(parentId, 10) : null;
    return this.filesystemService.getChildren(this.DEFAULT_USER_ID, id);
  }

  @Post("node")
  async createNode(@Body() dto: CreateNodeDto) {
    return this.filesystemService.createNode(this.DEFAULT_USER_ID, dto);
  }

  @Put("node/:id")
  async updateNode(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateNodeDto) {
    return this.filesystemService.updateNode(this.DEFAULT_USER_ID, id, dto);
  }

  @Delete("node/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNode(@Param("id", ParseIntPipe) id: number) {
    await this.filesystemService.deleteNode(this.DEFAULT_USER_ID, id);
  }

  @Put("node/:id/move")
  async moveNode(
    @Param("id", ParseIntPipe) id: number,
    @Body("newParentId", ParseIntPipe) newParentId: number
  ) {
    return this.filesystemService.moveNode(this.DEFAULT_USER_ID, id, newParentId);
  }
}

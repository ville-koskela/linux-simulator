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
import type { FilesystemNode, FilesystemTree } from "./filesystem.types";
// biome-ignore lint/style/useImportType: <Needed by dependency injection>
import { CreateNodeDto, UpdateNodeDto } from "./filesystem.types";

@Controller("filesystem")
export class FilesystemController {
  // Hardcoded user ID for now
  private readonly DEFAULT_USER_ID = 1;

  public constructor(private filesystemService: FilesystemService) {}

  @Get("tree")
  public async getTree(@Query("nodeId") nodeId?: string): Promise<FilesystemTree> {
    const id = nodeId ? parseInt(nodeId, 10) : undefined;
    return this.filesystemService.getTree(this.DEFAULT_USER_ID, id);
  }

  @Get("node/:id")
  public async getNode(@Param("id", ParseIntPipe) id: number): Promise<FilesystemNode | null> {
    return this.filesystemService.getNodeById(this.DEFAULT_USER_ID, id);
  }

  @Get("path")
  public async getNodeByPath(@Query("path") path: string): Promise<FilesystemNode | null> {
    if (!path) {
      path = "/";
    }
    return this.filesystemService.getNodeByPath(this.DEFAULT_USER_ID, path);
  }

  @Get("children")
  public async getChildren(@Query("parentId") parentId?: string): Promise<FilesystemNode[]> {
    const id = parentId ? parseInt(parentId, 10) : null;
    return this.filesystemService.getChildren(this.DEFAULT_USER_ID, id);
  }

  @Post("node")
  public async createNode(@Body() dto: CreateNodeDto): Promise<FilesystemNode> {
    return this.filesystemService.createNode(this.DEFAULT_USER_ID, dto);
  }

  @Put("node/:id")
  public async updateNode(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateNodeDto
  ): Promise<FilesystemNode> {
    return this.filesystemService.updateNode(this.DEFAULT_USER_ID, id, dto);
  }

  @Delete("node/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteNode(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.filesystemService.deleteNode(this.DEFAULT_USER_ID, id);
  }

  @Put("node/:id/move")
  public async moveNode(
    @Param("id", ParseIntPipe) id: number,
    @Body("newParentId", ParseIntPipe) newParentId: number
  ): Promise<FilesystemNode> {
    return this.filesystemService.moveNode(this.DEFAULT_USER_ID, id, newParentId);
  }
}

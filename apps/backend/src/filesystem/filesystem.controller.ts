import type {
  CreateNodeRequest,
  FilesystemNode,
  GetTreeResponse,
  UpdateNodeRequest,
} from "@linux-simulator/shared";
import {
  createNodeRequestSchema,
  moveNodeRequestSchema,
  updateNodeRequestSchema,
} from "@linux-simulator/shared";
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
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/user.decorator";
// biome-ignore lint/style/useImportType: Needed by dependency injection
import { FilesystemService } from "./filesystem.service";

@Controller("filesystem")
@UseGuards(AuthGuard)
export class FilesystemController {
  public constructor(private filesystemService: FilesystemService) {}

  @Get("tree")
  public async getTree(
    @CurrentUser() user: AuthUser,
    @Query("nodeId") nodeId?: string
  ): Promise<GetTreeResponse> {
    const id = nodeId ? parseInt(nodeId, 10) : undefined;
    return this.filesystemService.getTree(user.id, id);
  }

  @Get("node/:id")
  public async getNode(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseIntPipe) id: number
  ): Promise<FilesystemNode | null> {
    return this.filesystemService.getNodeById(user.id, id);
  }

  @Get("path")
  public async getNodeByPath(
    @CurrentUser() user: AuthUser,
    @Query("path") path: string
  ): Promise<FilesystemNode | null> {
    if (!path) {
      path = "/";
    }
    return this.filesystemService.getNodeByPath(user.id, path);
  }

  @Get("children")
  public async getChildren(
    @CurrentUser() user: AuthUser,
    @Query("parentId") parentId?: string
  ): Promise<FilesystemNode[]> {
    const id = parentId ? parseInt(parentId, 10) : null;
    return this.filesystemService.getChildren(user.id, id);
  }

  @Post("node")
  public async createNode(
    @CurrentUser() user: AuthUser,
    @Body() body: unknown
  ): Promise<FilesystemNode> {
    const dto: CreateNodeRequest = createNodeRequestSchema.parse(body);
    return this.filesystemService.createNode(user.id, dto);
  }

  @Put("node/:id")
  public async updateNode(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: unknown
  ): Promise<FilesystemNode> {
    const dto: UpdateNodeRequest = updateNodeRequestSchema.parse(body);
    return this.filesystemService.updateNode(user.id, id, dto);
  }

  @Delete("node/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteNode(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseIntPipe) id: number
  ): Promise<void> {
    await this.filesystemService.deleteNode(user.id, id);
  }

  @Put("node/:id/move")
  public async moveNode(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: unknown
  ): Promise<FilesystemNode> {
    const { newParentId } = moveNodeRequestSchema.parse(body);
    return this.filesystemService.moveNode(user.id, id, newParentId);
  }
}

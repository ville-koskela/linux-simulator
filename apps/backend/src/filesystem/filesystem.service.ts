import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: <Needed by dependency injection>
import { FilesystemRepository } from "../database/repositories";
// biome-ignore lint/style/useImportType: <Needed by dependency injection>
import { LoggerService } from "../logger/logger.service";
import type {
  CreateNodeDto,
  FilesystemNode,
  FilesystemTree,
  UpdateNodeDto,
} from "./filesystem.types";

@Injectable()
export class FilesystemService {
  constructor(
    private repository: FilesystemRepository,
    private logger: LoggerService
  ) {
    this.logger.setContext("FilesystemService");
  }

  async getNodeById(
    userId: number,
    nodeId: number
  ): Promise<FilesystemNode | null> {
    return this.repository.findById(userId, nodeId);
  }

  async getNodeByPath(
    userId: number,
    path: string
  ): Promise<FilesystemNode | null> {
    if (path === "/") {
      return this.repository.findRoot(userId);
    }

    const parts = path.split("/").filter((p) => p);
    let currentNode = await this.repository.findRoot(userId);
    if (!currentNode) return null;

    for (const part of parts) {
      if (!currentNode) return null;
      currentNode = await this.repository.findByParentAndName(
        userId,
        currentNode.id,
        part
      );
    }

    return currentNode;
  }

  async getChildren(
    userId: number,
    parentId: number | null
  ): Promise<FilesystemNode[]> {
    return this.repository.findChildren(userId, parentId);
  }

  async getTree(userId: number, nodeId?: number): Promise<FilesystemTree> {
    const rootNode = nodeId
      ? await this.getNodeById(userId, nodeId)
      : await this.getNodeByPath(userId, "/");

    if (!rootNode) {
      throw new NotFoundException("Node not found");
    }

    return this.buildTree(userId, rootNode);
  }

  private async buildTree(
    userId: number,
    node: FilesystemNode
  ): Promise<FilesystemTree> {
    const tree: FilesystemTree = {
      id: node.id,
      name: node.name,
      type: node.type,
      permissions: node.permissions,
    };

    if (node.type === "file") {
      tree.content = node.content || "";
    } else {
      const children = await this.getChildren(userId, node.id);
      tree.children = await Promise.all(
        children.map((child) => this.buildTree(userId, child))
      );
    }

    return tree;
  }

  async createNode(
    userId: number,
    dto: CreateNodeDto
  ): Promise<FilesystemNode> {
    // Validate parent exists if provided
    if (dto.parentId !== null) {
      const parent = await this.getNodeById(userId, dto.parentId);
      if (!parent) {
        throw new NotFoundException("Parent directory not found");
      }
      if (parent.type !== "directory") {
        throw new BadRequestException("Parent must be a directory");
      }
    }

    // Validate name
    if (!dto.name || dto.name.includes("/")) {
      throw new BadRequestException("Invalid name");
    }

    // Check for duplicate
    if (await this.repository.exists(userId, dto.parentId, dto.name)) {
      throw new ConflictException(
        `${dto.type === "directory" ? "Directory" : "File"} already exists`
      );
    }

    return this.repository.create(userId, dto);
  }

  async updateNode(
    userId: number,
    nodeId: number,
    dto: UpdateNodeDto
  ): Promise<FilesystemNode> {
    const node = await this.getNodeById(userId, nodeId);
    if (!node) {
      throw new NotFoundException("Node not found");
    }

    // Don't allow updating root
    if (node.parentId === null && node.name === "/") {
      throw new BadRequestException("Cannot modify root directory");
    }

    // Validate name if provided
    if (dto.name !== undefined && (!dto.name || dto.name.includes("/"))) {
      throw new BadRequestException("Invalid name");
    }

    // Build updates object
    const updates: {
      name?: string;
      content?: string;
      permissions?: string;
    } = {};

    if (dto.name !== undefined) {
      updates.name = dto.name;
    }

    if (dto.content !== undefined && node.type === "file") {
      updates.content = dto.content;
    }

    if (dto.permissions !== undefined) {
      updates.permissions = dto.permissions;
    }

    if (Object.keys(updates).length === 0) {
      return node;
    }

    return this.repository.update(userId, nodeId, updates);
  }

  async deleteNode(userId: number, nodeId: number): Promise<void> {
    const node = await this.getNodeById(userId, nodeId);
    if (!node) {
      throw new NotFoundException("Node not found");
    }

    // Don't allow deleting root
    if (node.parentId === null && node.name === "/") {
      throw new BadRequestException("Cannot delete root directory");
    }

    await this.repository.delete(userId, nodeId);
  }

  async moveNode(
    userId: number,
    nodeId: number,
    newParentId: number
  ): Promise<FilesystemNode> {
    const node = await this.getNodeById(userId, nodeId);
    if (!node) {
      throw new NotFoundException("Node not found");
    }

    const newParent = await this.getNodeById(userId, newParentId);
    if (!newParent || newParent.type !== "directory") {
      throw new BadRequestException("Invalid destination directory");
    }

    // Check for cycles using repository's efficient recursive CTE
    if (await this.repository.isDescendant(userId, nodeId, newParentId)) {
      throw new BadRequestException("Cannot move directory into itself");
    }

    return this.repository.move(userId, nodeId, newParentId);
  }
}

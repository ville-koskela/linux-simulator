import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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

// ---------------------------------------------------------------------------
// Permission helpers
// ---------------------------------------------------------------------------
//
// Permissions are stored as a 9-character Unix-style string, e.g. "rwxr-xr-x":
//   [0] owner-read  [1] owner-write  [2] owner-execute
//   [3] group-read  [4] group-write  [5] group-execute   (groups not modelled)
//   [6] other-read  [7] other-write  [8] other-execute
//
// "Owner" is identified by ownerId === userId.
// System nodes (ownerId === null) are treated as non-owner for all callers.

function permBit(
  permissions: string,
  ownerBit: number,
  otherBit: number,
  isOwner: boolean
): boolean {
  const ch = permissions[isOwner ? ownerBit : otherBit];
  return ch !== undefined && ch !== "-";
}

function canRead(node: FilesystemNode, userId: number): boolean {
  return permBit(node.permissions, 0, 6, node.ownerId === userId);
}

function canWrite(node: FilesystemNode, userId: number): boolean {
  return permBit(node.permissions, 1, 7, node.ownerId === userId);
}

function canExecute(node: FilesystemNode, userId: number): boolean {
  return permBit(node.permissions, 2, 8, node.ownerId === userId);
}

// ---------------------------------------------------------------------------

@Injectable()
export class FilesystemService {
  public constructor(
    private repository: FilesystemRepository,
    private logger: LoggerService
  ) {
    this.logger.setContext("FilesystemService");
  }

  public async getNodeById(userId: number, nodeId: number): Promise<FilesystemNode | null> {
    const node = await this.repository.findById(nodeId);
    if (!node) return null;
    if (!canRead(node, userId)) return null; // treat unreadable nodes as non-existent
    return node;
  }

  public async getNodeByPath(userId: number, path: string): Promise<FilesystemNode | null> {
    if (path === "/") {
      const root = await this.repository.findRoot();
      if (!root || !canRead(root, userId)) return null;
      return root;
    }

    const parts = path.split("/").filter((p) => p);
    let current = await this.repository.findRoot();
    if (!current) return null;

    for (const part of parts) {
      if (!current) return null;
      // Need execute permission to traverse a directory
      if (!canExecute(current, userId)) return null;
      current = await this.repository.findByParentAndName(current.id, part);
    }

    if (!current || !canRead(current, userId)) return null;
    return current;
  }

  public async getChildren(userId: number, parentId: number | null): Promise<FilesystemNode[]> {
    if (parentId !== null) {
      const parent = await this.repository.findById(parentId);
      if (!parent || !canRead(parent, userId)) {
        throw new ForbiddenException("Permission denied");
      }
    }

    const children = await this.repository.findChildren(parentId);
    // Filter to only nodes the user can read
    return children.filter((child) => canRead(child, userId));
  }

  public async getTree(userId: number, nodeId?: number): Promise<FilesystemTree> {
    const rootNode = nodeId
      ? await this.getNodeById(userId, nodeId)
      : await this.getNodeByPath(userId, "/");

    if (!rootNode) {
      throw new NotFoundException("Node not found");
    }

    return this.buildTree(userId, rootNode);
  }

  private async buildTree(userId: number, node: FilesystemNode): Promise<FilesystemTree> {
    const tree: FilesystemTree = {
      id: node.id,
      name: node.name,
      type: node.type,
      permissions: node.permissions,
    };

    if (node.type === "file") {
      tree.content = node.content || "";
    } else {
      const children = await this.repository.findChildren(node.id);
      const readable = children.filter((c) => canRead(c, userId));
      tree.children = await Promise.all(readable.map((child) => this.buildTree(userId, child)));
    }

    return tree;
  }

  public async createNode(userId: number, dto: CreateNodeDto): Promise<FilesystemNode> {
    // Validate parent exists and user can write to it
    if (dto.parentId !== null) {
      const parent = await this.repository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException("Parent directory not found");
      }
      if (parent.type !== "directory") {
        throw new BadRequestException("Parent must be a directory");
      }
      if (!canWrite(parent, userId)) {
        throw new ForbiddenException("Permission denied: cannot write to parent directory");
      }
    }

    // Validate name
    if (!dto.name || dto.name.includes("/")) {
      throw new BadRequestException("Invalid name");
    }

    // Check for duplicate
    if (await this.repository.exists(dto.parentId, dto.name)) {
      throw new ConflictException(
        `${dto.type === "directory" ? "Directory" : "File"} already exists`
      );
    }

    return this.repository.create(userId, dto);
  }

  public async updateNode(
    userId: number,
    nodeId: number,
    dto: UpdateNodeDto
  ): Promise<FilesystemNode> {
    const node = await this.repository.findById(nodeId);
    if (!node) {
      throw new NotFoundException("Node not found");
    }

    // Don't allow updating root
    if (node.parentId === null && node.name === "/") {
      throw new BadRequestException("Cannot modify root directory");
    }

    // Only the owner can rename, change permissions, or update content
    if (!canWrite(node, userId)) {
      throw new ForbiddenException("Permission denied");
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

    // Only the owner may change permissions
    if (dto.permissions !== undefined) {
      if (node.ownerId !== userId) {
        throw new ForbiddenException("Permission denied: only the owner can change permissions");
      }
      updates.permissions = dto.permissions;
    }

    if (Object.keys(updates).length === 0) {
      return node;
    }

    return this.repository.update(nodeId, updates);
  }

  public async deleteNode(userId: number, nodeId: number): Promise<void> {
    const node = await this.repository.findById(nodeId);
    if (!node) {
      throw new NotFoundException("Node not found");
    }

    // Don't allow deleting root
    if (node.parentId === null && node.name === "/") {
      throw new BadRequestException("Cannot delete root directory");
    }

    // Need write permission on the node's parent directory to unlink it
    if (node.parentId !== null) {
      const parent = await this.repository.findById(node.parentId);
      if (parent && !canWrite(parent, userId)) {
        throw new ForbiddenException("Permission denied: cannot remove from parent directory");
      }
    }

    await this.repository.delete(nodeId);
  }

  public async moveNode(
    userId: number,
    nodeId: number,
    newParentId: number
  ): Promise<FilesystemNode> {
    const node = await this.repository.findById(nodeId);
    if (!node) {
      throw new NotFoundException("Node not found");
    }

    const newParent = await this.repository.findById(newParentId);
    if (!newParent || newParent.type !== "directory") {
      throw new BadRequestException("Invalid destination directory");
    }

    // Need write on source parent (to unlink) and write on destination (to link)
    if (node.parentId !== null) {
      const srcParent = await this.repository.findById(node.parentId);
      if (srcParent && !canWrite(srcParent, userId)) {
        throw new ForbiddenException("Permission denied: cannot remove from source directory");
      }
    }

    if (!canWrite(newParent, userId)) {
      throw new ForbiddenException("Permission denied: cannot write to destination directory");
    }

    // Check for cycles using repository's efficient recursive CTE
    if (await this.repository.isDescendant(nodeId, newParentId)) {
      throw new BadRequestException("Cannot move directory into itself");
    }

    return this.repository.move(nodeId, newParentId);
  }
}

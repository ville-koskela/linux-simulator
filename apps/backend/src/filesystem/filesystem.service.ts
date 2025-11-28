import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { QueryResult } from "pg";
import type { DatabaseService } from "../database/database.service";
import type { LoggerService } from "../logger/logger.service";
import type {
  CreateNodeDto,
  FilesystemNode,
  FilesystemTree,
  UpdateNodeDto,
} from "./filesystem.types";

@Injectable()
export class FilesystemService {
  constructor(
    private db: DatabaseService,
    private logger: LoggerService
  ) {
    this.logger.setContext("FilesystemService");
  }

  async getNodeById(
    userId: number,
    nodeId: number
  ): Promise<FilesystemNode | null> {
    const result = await this.db.query<FilesystemNode>(
      "SELECT * FROM filesystem_nodes WHERE id = $1 AND user_id = $2",
      [nodeId, userId]
    );
    return result.rows[0] || null;
  }

  async getNodeByPath(
    userId: number,
    path: string
  ): Promise<FilesystemNode | null> {
    if (path === "/") {
      const result = await this.db.query<FilesystemNode>(
        "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND parent_id IS NULL AND name = $2",
        [userId, "/"]
      );
      return result.rows[0] || null;
    }

    const parts = path.split("/").filter((p) => p);
    const rootResult = await this.db.query<FilesystemNode>(
      "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND parent_id IS NULL AND name = $2",
      [userId, "/"]
    );

    let currentNode: FilesystemNode | null = rootResult.rows[0] || null;
    if (!currentNode) return null;

    for (const part of parts) {
      if (!currentNode) return null;
      const parentId: number = currentNode.id;
      const queryResult: QueryResult<FilesystemNode> =
        await this.db.query<FilesystemNode>(
          "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND parent_id = $2 AND name = $3",
          [userId, parentId, part]
        );

      if (queryResult.rows.length === 0) return null;
      currentNode = queryResult.rows[0];
    }

    return currentNode;
  }

  async getChildren(
    userId: number,
    parentId: number | null
  ): Promise<FilesystemNode[]> {
    const query =
      parentId === null
        ? "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND parent_id IS NULL ORDER BY type DESC, name"
        : "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND parent_id = $2 ORDER BY type DESC, name";

    const params = parentId === null ? [userId] : [userId, parentId];
    const result = await this.db.query<FilesystemNode>(query, params);

    return result.rows;
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
    const existing = await this.db.query(
      "SELECT id FROM filesystem_nodes WHERE user_id = $1 AND parent_id = $2 AND name = $3",
      [userId, dto.parentId, dto.name]
    );

    if (existing.rows.length > 0) {
      throw new ConflictException(
        `${dto.type === "directory" ? "Directory" : "File"} already exists`
      );
    }

    const result = await this.db.query<FilesystemNode>(
      `INSERT INTO filesystem_nodes (user_id, parent_id, name, type, content, permissions)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        dto.parentId,
        dto.name,
        dto.type,
        dto.content || null,
        dto.permissions ||
          (dto.type === "directory" ? "rwxr-xr-x" : "rw-r--r--"),
      ]
    );

    return result.rows[0];
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

    const updates: string[] = [];
    const values: (string | null)[] = [];
    let paramIndex = 1;

    if (dto.name !== undefined) {
      if (!dto.name || dto.name.includes("/")) {
        throw new BadRequestException("Invalid name");
      }
      updates.push(`name = $${paramIndex++}`);
      values.push(dto.name);
    }

    if (dto.content !== undefined && node.type === "file") {
      updates.push(`content = $${paramIndex++}`);
      values.push(dto.content);
    }

    if (dto.permissions !== undefined) {
      updates.push(`permissions = $${paramIndex++}`);
      values.push(dto.permissions);
    }

    if (updates.length === 0) {
      return node;
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(String(userId), String(nodeId));

    const result = await this.db.query<FilesystemNode>(
      `UPDATE filesystem_nodes 
       SET ${updates.join(", ")}
       WHERE user_id = $${paramIndex++} AND id = $${paramIndex++}
       RETURNING *`,
      values
    );

    return result.rows[0];
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

    await this.db.query(
      "DELETE FROM filesystem_nodes WHERE user_id = $1 AND id = $2",
      [userId, nodeId]
    );
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

    // Check for cycles
    if (await this.wouldCreateCycle(userId, nodeId, newParentId)) {
      throw new BadRequestException("Cannot move directory into itself");
    }

    const result = await this.db.query<FilesystemNode>(
      `UPDATE filesystem_nodes 
       SET parent_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2 AND id = $3
       RETURNING *`,
      [newParentId, userId, nodeId]
    );

    return result.rows[0];
  }

  private async wouldCreateCycle(
    userId: number,
    nodeId: number,
    newParentId: number
  ): Promise<boolean> {
    let currentId: number | null = newParentId;

    while (currentId !== null) {
      if (currentId === nodeId) return true;

      const parent = await this.getNodeById(userId, currentId);
      currentId = parent?.parentId || null;
    }

    return false;
  }
}

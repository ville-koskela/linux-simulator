import { Injectable } from "@nestjs/common";
import type { PoolClient } from "pg";
import type {
  CreateNodeDto,
  FilesystemNode,
} from "../../filesystem/filesystem.types";
// biome-ignore lint/style/useImportType: <Needed by dependency injection>
import { DatabaseService } from "../database.service";

@Injectable()
export class FilesystemRepository {
  constructor(private db: DatabaseService) {}

  async findById(
    userId: number,
    nodeId: number
  ): Promise<FilesystemNode | null> {
    const result = await this.db.query<FilesystemNode>(
      "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND id = $2",
      [userId, nodeId]
    );
    return result.rows[0] || null;
  }

  async findByPath(
    userId: number,
    path: string
  ): Promise<FilesystemNode | null> {
    // Handle root path
    if (path === "/") {
      const result = await this.db.query<FilesystemNode>(
        "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND parent_id IS NULL AND name = $2",
        [userId, "/"]
      );
      return result.rows[0] || null;
    }

    // For other paths, we need to traverse the tree
    // This could be optimized with recursive CTE, but keeping it simple for now
    return null; // Caller should use traversal logic
  }

  async findRoot(userId: number): Promise<FilesystemNode | null> {
    const result = await this.db.query<FilesystemNode>(
      "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND parent_id IS NULL AND name = $2",
      [userId, "/"]
    );
    return result.rows[0] || null;
  }

  async findByParentAndName(
    userId: number,
    parentId: number,
    name: string
  ): Promise<FilesystemNode | null> {
    const result = await this.db.query<FilesystemNode>(
      "SELECT * FROM filesystem_nodes WHERE user_id = $1 AND parent_id = $2 AND name = $3",
      [userId, parentId, name]
    );
    return result.rows[0] || null;
  }

  async findChildren(
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

  async exists(
    userId: number,
    parentId: number | null,
    name: string
  ): Promise<boolean> {
    const result = await this.db.query(
      "SELECT id FROM filesystem_nodes WHERE user_id = $1 AND parent_id = $2 AND name = $3",
      [userId, parentId, name]
    );
    return result.rows.length > 0;
  }

  async create(userId: number, dto: CreateNodeDto): Promise<FilesystemNode> {
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

  async update(
    userId: number,
    nodeId: number,
    updates: {
      name?: string;
      content?: string;
      permissions?: string;
    }
  ): Promise<FilesystemNode> {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    let paramIndex = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }

    if (updates.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      values.push(updates.content);
    }

    if (updates.permissions !== undefined) {
      fields.push(`permissions = $${paramIndex++}`);
      values.push(updates.permissions);
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(userId, nodeId);

    const result = await this.db.query<FilesystemNode>(
      `UPDATE filesystem_nodes 
       SET ${fields.join(", ")}
       WHERE user_id = $${paramIndex++} AND id = $${paramIndex++}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  async move(
    userId: number,
    nodeId: number,
    newParentId: number | null
  ): Promise<FilesystemNode> {
    const result = await this.db.query<FilesystemNode>(
      `UPDATE filesystem_nodes 
       SET parent_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2 AND id = $3
       RETURNING *`,
      [newParentId, userId, nodeId]
    );
    return result.rows[0];
  }

  async delete(userId: number, nodeId: number): Promise<void> {
    await this.db.query(
      "DELETE FROM filesystem_nodes WHERE user_id = $1 AND id = $2",
      [userId, nodeId]
    );
  }

  async isDescendant(
    userId: number,
    potentialAncestorId: number,
    potentialDescendantId: number
  ): Promise<boolean> {
    // Use recursive CTE to check if node is descendant
    const result = await this.db.query<{ exists: boolean }>(
      `WITH RECURSIVE descendants AS (
        SELECT id, parent_id FROM filesystem_nodes 
        WHERE user_id = $1 AND id = $2
        UNION ALL
        SELECT fn.id, fn.parent_id FROM filesystem_nodes fn
        INNER JOIN descendants d ON fn.parent_id = d.id
        WHERE fn.user_id = $1
      )
      SELECT EXISTS(SELECT 1 FROM descendants WHERE id = $3) as exists`,
      [userId, potentialAncestorId, potentialDescendantId]
    );
    return result.rows[0]?.exists || false;
  }

  /**
   * Execute operations in a transaction
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    return this.db.transaction(callback);
  }
}

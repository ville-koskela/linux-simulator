import { filesystemNodeSchema } from "@linux-simulator/shared";
import { Injectable } from "@nestjs/common";
import { z } from "zod";
import type { CreateNodeDto, FilesystemNode } from "../../filesystem/filesystem.types";
// biome-ignore lint/style/useImportType: <Needed by dependency injection>
import { DatabaseService } from "../database.service";

// Schema for array results
// biome-ignore lint/nursery/useExplicitType: We don't re-write all the types when definning schemas
const filesystemNodeArraySchema = z.array(filesystemNodeSchema);

@Injectable()
export class FilesystemRepository {
  public constructor(private db: DatabaseService) {}

  public async findById(nodeId: number): Promise<FilesystemNode | null> {
    const result = await this.db.query("SELECT * FROM filesystem_nodes WHERE id = $1", [nodeId]);

    if (result.rows.length === 0) {
      return null;
    }

    return filesystemNodeSchema.parse(result.rows[0]);
  }

  public async findRoot(): Promise<FilesystemNode | null> {
    const result = await this.db.query(
      "SELECT * FROM filesystem_nodes WHERE parent_id IS NULL AND name = '/'",
      []
    );

    if (result.rows.length === 0) {
      return null;
    }

    return filesystemNodeSchema.parse(result.rows[0]);
  }

  public async findByParentAndName(parentId: number, name: string): Promise<FilesystemNode | null> {
    const result = await this.db.query(
      "SELECT * FROM filesystem_nodes WHERE parent_id = $1 AND name = $2",
      [parentId, name]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return filesystemNodeSchema.parse(result.rows[0]);
  }

  public async findChildren(parentId: number | null): Promise<FilesystemNode[]> {
    const query =
      parentId === null
        ? "SELECT * FROM filesystem_nodes WHERE parent_id IS NULL ORDER BY type DESC, name"
        : "SELECT * FROM filesystem_nodes WHERE parent_id = $1 ORDER BY type DESC, name";

    const params = parentId === null ? [] : [parentId];
    const result = await this.db.query(query, params);

    return filesystemNodeArraySchema.parse(result.rows);
  }

  public async exists(parentId: number | null, name: string): Promise<boolean> {
    // IS NOT DISTINCT FROM treats NULL = NULL as true (unlike =)
    const result = await this.db.query(
      "SELECT id FROM filesystem_nodes WHERE parent_id IS NOT DISTINCT FROM $1 AND name = $2",
      [parentId, name]
    );
    return result.rows.length > 0;
  }

  public async create(ownerId: number, dto: CreateNodeDto): Promise<FilesystemNode> {
    const result = await this.db.query(
      `INSERT INTO filesystem_nodes (owner_id, parent_id, name, type, content, permissions)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        ownerId,
        dto.parentId,
        dto.name,
        dto.type,
        dto.content || null,
        dto.permissions || (dto.type === "directory" ? "rwxr-xr-x" : "rw-r--r--"),
      ]
    );
    return filesystemNodeSchema.parse(result.rows[0]);
  }

  public async update(
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
    values.push(nodeId);

    const result = await this.db.query(
      `UPDATE filesystem_nodes 
       SET ${fields.join(", ")}
       WHERE id = $${paramIndex++}
       RETURNING *`,
      values
    );

    return filesystemNodeSchema.parse(result.rows[0]);
  }

  public async move(nodeId: number, newParentId: number | null): Promise<FilesystemNode> {
    const result = await this.db.query(
      `UPDATE filesystem_nodes 
       SET parent_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [newParentId, nodeId]
    );
    return filesystemNodeSchema.parse(result.rows[0]);
  }

  public async delete(nodeId: number): Promise<void> {
    await this.db.query("DELETE FROM filesystem_nodes WHERE id = $1", [nodeId]);
  }

  public async isDescendant(
    potentialAncestorId: number,
    potentialDescendantId: number
  ): Promise<boolean> {
    // Use recursive CTE to check if potentialDescendantId lives inside potentialAncestorId
    const result = await this.db.query<{ exists: boolean }>(
      `WITH RECURSIVE descendants AS (
        SELECT id, parent_id FROM filesystem_nodes WHERE id = $1
        UNION ALL
        SELECT fn.id, fn.parent_id FROM filesystem_nodes fn
        INNER JOIN descendants d ON fn.parent_id = d.id
      )
      SELECT EXISTS(SELECT 1 FROM descendants WHERE id = $2) as exists`,
      [potentialAncestorId, potentialDescendantId]
    );
    return result.rows[0]?.exists || false;
  }
}

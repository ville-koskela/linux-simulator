import type {
  CreateNodeRequest,
  FilesystemNode,
  MoveNodeRequest,
  UpdateNodeRequest,
} from "@linux-simulator/shared";
import {
  filesystemNodeSchema,
  getChildrenResponseSchema,
  getNodeResponseSchema,
} from "@linux-simulator/shared";
import { apiFetch } from "./api.service";

export const FilesystemService = {
  async getNodeByPath(path: string): Promise<FilesystemNode | null> {
    try {
      const response = await apiFetch<unknown>(`/filesystem/path?path=${encodeURIComponent(path)}`);
      return getNodeResponseSchema.parse(response);
    } catch {
      return null;
    }
  },

  async getChildren(parentId: number | null): Promise<FilesystemNode[]> {
    const query = parentId !== null ? `?parentId=${parentId}` : "";
    const response = await apiFetch<unknown>(`/filesystem/children${query}`);
    return getChildrenResponseSchema.parse(response);
  },

  async createNode(
    parentId: number | null,
    name: string,
    type: "file" | "directory",
    content?: string
  ): Promise<FilesystemNode> {
    const response = await apiFetch<unknown>("/filesystem/node", {
      method: "POST",
      body: JSON.stringify({
        parentId,
        name,
        type,
        content: content || undefined,
        permissions: "rwxr-xr-x",
      } satisfies CreateNodeRequest),
    });

    return filesystemNodeSchema.parse(response);
  },

  async updateNode(
    id: number,
    updates: { name?: string; content?: string; permissions?: string }
  ): Promise<FilesystemNode> {
    const response = await apiFetch<unknown>(`/filesystem/node/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates satisfies UpdateNodeRequest),
    });

    return filesystemNodeSchema.parse(response);
  },

  async deleteNode(id: number): Promise<void> {
    await apiFetch<void>(`/filesystem/node/${id}`, {
      method: "DELETE",
    });
  },

  async moveNode(id: number, newParentId: number): Promise<FilesystemNode> {
    const response = await apiFetch<unknown>(`/filesystem/node/${id}/move`, {
      method: "PUT",
      body: JSON.stringify({ newParentId } satisfies MoveNodeRequest),
    });

    return filesystemNodeSchema.parse(response);
  },

  async updateFileContent(path: string, content: string): Promise<void> {
    const node = await this.getNodeByPath(path);
    if (node) {
      await this.updateNode(node.id, { content });
    } else {
      // Create new file
      const pathParts = path.split("/").filter(Boolean);
      const filename = pathParts.pop() || "";
      const parentPath = pathParts.length > 0 ? `/${pathParts.join("/")}` : "/";
      const parentNode = await this.getNodeByPath(parentPath);

      if (parentNode) {
        await this.createNode(parentNode.id, filename, "file", content);
      } else {
        throw new Error(`Parent directory not found: ${parentPath}`);
      }
    }
  },
};

import type { FilesystemNode } from "@linux-simulator/shared";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const FilesystemService = {
  async getNodeByPath(path: string): Promise<FilesystemNode | null> {
    try {
      return await apiFetch<FilesystemNode>(
        `/filesystem/path?path=${encodeURIComponent(path)}`
      );
    } catch {
      return null;
    }
  },

  async getChildren(parentId: number | null): Promise<FilesystemNode[]> {
    const query = parentId !== null ? `?parentId=${parentId}` : "";
    return apiFetch<FilesystemNode[]>(`/filesystem/children${query}`);
  },

  async createNode(
    parentId: number | null,
    name: string,
    type: "file" | "directory",
    content?: string
  ): Promise<FilesystemNode> {
    return apiFetch<FilesystemNode>("/filesystem/node", {
      method: "POST",
      body: JSON.stringify({
        parentId,
        name,
        type,
        content: content || null,
        permissions: "rwxr-xr-x",
      }),
    });
  },

  async updateNode(
    id: number,
    updates: { name?: string; content?: string; permissions?: string }
  ): Promise<FilesystemNode> {
    return apiFetch<FilesystemNode>(`/filesystem/node/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  },

  async deleteNode(id: number): Promise<void> {
    await fetch(`${API_BASE_URL}/filesystem/node/${id}`, {
      method: "DELETE",
    });
  },

  async moveNode(id: number, newParentId: number): Promise<FilesystemNode> {
    return apiFetch<FilesystemNode>(`/filesystem/node/${id}/move`, {
      method: "PUT",
      body: JSON.stringify({ newParentId }),
    });
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

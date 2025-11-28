// Filesystem types
export interface FilesystemNode {
  id: number;
  userId: number;
  parentId: number | null;
  name: string;
  type: "file" | "directory";
  content: string | null;
  permissions: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNodeDto {
  parentId: number | null;
  name: string;
  type: "file" | "directory";
  content?: string;
  permissions?: string;
}

export interface UpdateNodeDto {
  name?: string;
  content?: string;
  permissions?: string;
}

export interface FilesystemTree {
  id: number;
  name: string;
  type: "file" | "directory";
  permissions: string;
  content?: string;
  children?: FilesystemTree[];
}

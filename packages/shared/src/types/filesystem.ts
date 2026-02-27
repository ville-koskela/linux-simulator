/** biome-ignore-all lint/nursery/useExplicitType: For now we don't type schemas explicitly */
import { z } from "zod";

// Base schemas
export const nodeTypeSchema = z.enum(["file", "directory"]);

export const filesystemNodeSchema = z.object({
  id: z.number(),
  ownerId: z.number(),
  parentId: z.number().nullable(),
  name: z.string(),
  type: nodeTypeSchema,
  content: z.string().nullable(),
  permissions: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type FilesystemNode = z.infer<typeof filesystemNodeSchema>;

// Request schemas
export const createNodeRequestSchema = z.object({
  parentId: z.number().nullable(),
  name: z.string().min(1),
  type: nodeTypeSchema,
  content: z.string().optional(),
  permissions: z.string().optional(),
});

export type CreateNodeRequest = z.infer<typeof createNodeRequestSchema>;

export const updateNodeRequestSchema = z.object({
  name: z.string().min(1).optional(),
  content: z.string().optional(),
  permissions: z.string().optional(),
});

export type UpdateNodeRequest = z.infer<typeof updateNodeRequestSchema>;

export const moveNodeRequestSchema = z.object({
  newParentId: z.number(),
});

export type MoveNodeRequest = z.infer<typeof moveNodeRequestSchema>;

// Response schemas
export const filesystemTreeSchema: z.ZodType<FilesystemTree> = z.lazy(() =>
  z.object({
    id: z.number(),
    name: z.string(),
    type: nodeTypeSchema,
    permissions: z.string(),
    content: z.string().optional(),
    children: z.array(filesystemTreeSchema).optional(),
  })
);

export type FilesystemTree = {
  id: number;
  name: string;
  type: "file" | "directory";
  permissions: string;
  content?: string;
  children?: FilesystemTree[];
};

export const getTreeResponseSchema = filesystemTreeSchema;
export type GetTreeResponse = FilesystemTree;

export const getNodeResponseSchema = filesystemNodeSchema.nullable();
export type GetNodeResponse = z.infer<typeof getNodeResponseSchema>;

export const getChildrenResponseSchema = z.array(filesystemNodeSchema);
export type GetChildrenResponse = z.infer<typeof getChildrenResponseSchema>;

// Legacy DTO types (for backward compatibility)
export type CreateNodeDto = CreateNodeRequest;
export type UpdateNodeDto = UpdateNodeRequest;

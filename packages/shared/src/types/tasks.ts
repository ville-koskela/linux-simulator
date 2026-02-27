/** biome-ignore-all lint/nursery/useExplicitType: For now we don't type schemas explicitly */
import { z } from "zod";
import { commandNameSchema } from "./commands.js";
import { languageCodeSchema } from "./settings.js";

// ---------------------------------------------------------------------------
// Task conditions – declarative, evaluated on the frontend
// ---------------------------------------------------------------------------

export const taskConditionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("run_command"), command: commandNameSchema }),
  z.object({ type: z.literal("run_command_n_times"), command: commandNameSchema, n: z.number() }),
  z.object({
    type: z.literal("run_command_with_args"),
    command: commandNameSchema,
    args: z.array(z.string()),
  }),
  z.object({ type: z.literal("create_file") }),
  z.object({ type: z.literal("create_directory") }),
  z.object({ type: z.literal("navigate_to_path"), path: z.string() }),
  z.object({ type: z.literal("edit_and_save_file") }),
  z.object({ type: z.literal("delete_file_or_dir") }),
  z.object({ type: z.literal("move_file_or_dir") }),
]);

export type TaskCondition = z.infer<typeof taskConditionSchema>;

// ---------------------------------------------------------------------------
// Task categories
// ---------------------------------------------------------------------------

export const taskCategorySchema = z.enum(["navigation", "files", "editor", "exploration"]);

export type TaskCategory = z.infer<typeof taskCategorySchema>;

// ---------------------------------------------------------------------------
// Task definition
// ---------------------------------------------------------------------------

export const taskSchema = z.object({
  key: z.string(),
  category: taskCategorySchema,
  xpReward: z.number().int().positive(),
  requiredLevel: z.number().int().min(1),
  condition: taskConditionSchema,
  translations: z.record(
    languageCodeSchema,
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
});

export type Task = z.infer<typeof taskSchema>;

// ---------------------------------------------------------------------------
// API response types
// ---------------------------------------------------------------------------

export const taskProgressSchema = z.object({
  taskKey: z.string(),
  completedAt: z.coerce.date(),
});

export type TaskProgress = z.infer<typeof taskProgressSchema>;

export const userProgressSchema = z.object({
  xp: z.number().int().min(0),
  level: z.number().int().min(1),
  completedTasks: z.array(taskProgressSchema),
});

export type UserProgress = z.infer<typeof userProgressSchema>;

export const completeTaskResponseSchema = z.object({
  xp: z.number().int().min(0),
  level: z.number().int().min(1),
  leveledUp: z.boolean(),
  xpGained: z.number().int().min(0),
  newUnlockLevels: z.array(z.number()),
});

export type CompleteTaskResponse = z.infer<typeof completeTaskResponseSchema>;

// ---------------------------------------------------------------------------
// Command execution event – passed from Terminal to ProgressContext
// ---------------------------------------------------------------------------

export interface CommandExecutionEvent {
  command: string;
  args: string[];
  currentPath: string;
  /** Emitted when a filesystem write succeeded (touch, mkdir, mv, rm, cat >…) */
  fsEvent?: "file_created" | "dir_created" | "file_deleted" | "node_moved" | "file_saved";
}

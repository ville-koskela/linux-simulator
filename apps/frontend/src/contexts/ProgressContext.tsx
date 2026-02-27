import {
  type CommandExecutionEvent,
  TASKS,
  type Task,
  type TaskCondition,
  type UserProgress,
  getAvailableCommands,
  levelProgress,
} from "@linux-simulator/shared";
import {
  type Context,
  type JSX,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProgressApiService } from "../services/progress.service";
import { logger } from "../utils/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LevelUpInfo {
  newLevel: number;
  newCommands: string[];
}

interface ProgressContextValue {
  xp: number;
  level: number;
  /** 0–1 progress towards the next level */
  levelProgressFraction: number;
  completedTaskKeys: Set<string>;
  /** Tasks unlocked at the current level, sorted by category */
  availableTasks: Task[];
  /** Call this after every terminal command execution */
  recordCommandExecution: (event: CommandExecutionEvent) => Promise<void>;
  /** Pending level-up info to display; clear it via acknowledgeLevel */
  pendingLevelUp: LevelUpInfo | null;
  acknowledgeLevel: () => void;
  isLoading: boolean;
}

const ProgressContext: Context<ProgressContextValue | null> =
  createContext<ProgressContextValue | null>(null);

// ---------------------------------------------------------------------------
// Condition evaluator
// ---------------------------------------------------------------------------

function evaluateCondition(
  condition: TaskCondition,
  event: CommandExecutionEvent,
  commandCounts: Map<string, number>
): boolean {
  switch (condition.type) {
    case "run_command":
      return event.command === condition.command;

    case "run_command_n_times": {
      const count = commandCounts.get(condition.command) ?? 0;
      return event.command === condition.command && count >= condition.n;
    }

    case "run_command_with_args":
      return (
        event.command === condition.command && condition.args.every((a, i) => event.args[i] === a)
      );

    case "create_file":
      return event.fsEvent === "file_created";

    case "create_directory":
      return event.fsEvent === "dir_created";

    case "navigate_to_path":
      return event.command === "cd" && event.currentPath === condition.path;

    case "edit_and_save_file":
      return event.fsEvent === "file_saved";

    case "delete_file_or_dir":
      return event.fsEvent === "file_deleted";

    case "move_file_or_dir":
      return event.fsEvent === "node_moved";

    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface ProgressProviderProps {
  children: ReactNode;
}

export function ProgressProvider({ children }: ProgressProviderProps): JSX.Element {
  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    level: 1,
    completedTasks: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingLevelUp, setPendingLevelUp] = useState<LevelUpInfo | null>(null);

  /** In-memory command execution counts (not persisted – reset on refresh) */
  const commandCounts = useRef<Map<string, number>>(new Map());

  const completedTaskKeys = useMemo(
    () => new Set(progress.completedTasks.map((t) => t.taskKey)),
    [progress.completedTasks]
  );

  const availableTasks = useMemo(
    () => TASKS.filter((t) => t.requiredLevel <= progress.level),
    [progress.level]
  );

  // Load initial progress
  useEffect(() => {
    ProgressApiService.getProgress()
      .then((p) => setProgress(p))
      .catch((err) => logger.error("Failed to load progress", err))
      .finally(() => setIsLoading(false));
  }, []);

  const recordCommandExecution = useCallback(
    async (event: CommandExecutionEvent): Promise<void> => {
      // Update command count
      const current = commandCounts.current.get(event.command) ?? 0;
      commandCounts.current.set(event.command, current + 1);

      // Evaluate all unlocked, not-yet-completed tasks
      const candidates = TASKS.filter(
        (t) => t.requiredLevel <= progress.level && !completedTaskKeys.has(t.key)
      );

      const completed = candidates.filter((t) =>
        evaluateCondition(t.condition, event, commandCounts.current)
      );

      if (completed.length === 0) return;

      // Complete them sequentially (usually just 1)
      for (const task of completed) {
        try {
          const result = await ProgressApiService.completeTask(task.key);

          setProgress((prev) => ({
            xp: result.xp,
            level: result.level,
            completedTasks: [
              ...prev.completedTasks,
              { taskKey: task.key, completedAt: new Date() },
            ],
          }));

          if (result.leveledUp) {
            const allNewCommands = getAvailableCommands(result.level)
              .filter((c) => result.newUnlockLevels.includes(c.level))
              .map((c) => c.name as string);

            setPendingLevelUp({ newLevel: result.level, newCommands: allNewCommands });
          }
        } catch (err) {
          logger.error(`Failed to complete task '${task.key}'`, err);
        }
      }
    },
    [progress.level, completedTaskKeys]
  );

  const acknowledgeLevel = useCallback(() => setPendingLevelUp(null), []);

  const value = useMemo(
    (): ProgressContextValue => ({
      xp: progress.xp,
      level: progress.level,
      levelProgressFraction: levelProgress(progress.xp),
      completedTaskKeys,
      availableTasks,
      recordCommandExecution,
      pendingLevelUp,
      acknowledgeLevel,
      isLoading,
    }),
    [
      progress.xp,
      progress.level,
      completedTaskKeys,
      availableTasks,
      recordCommandExecution,
      pendingLevelUp,
      acknowledgeLevel,
      isLoading,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}

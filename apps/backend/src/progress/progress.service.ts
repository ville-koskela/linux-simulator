import {
  type CompleteTaskResponse,
  TASKS,
  type TaskProgress,
  type UserProgress,
  xpToLevel,
} from "@linux-simulator/shared";
import { Injectable, NotFoundException } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Needed by dependency injection
import { DatabaseService } from "../database/database.service";
// biome-ignore lint/style/useImportType: Needed by dependency injection
import { LoggerService } from "../logger/logger.service";

interface DbProgress {
  xp: number;
  level: number;
}

interface DbCompletedTask {
  taskKey: string;
  completedAt: Date;
}

@Injectable()
export class ProgressService {
  public constructor(
    private readonly db: DatabaseService,
    private readonly logger: LoggerService
  ) {
    this.logger.setContext("ProgressService");
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Return the current XP, level, and completed tasks for a user.
   * Upserts a fresh row if this is the first call for the user.
   */
  public async getProgress(userId: number): Promise<UserProgress> {
    await this.ensureProgressRow(userId);

    const [progressResult, tasksResult] = await Promise.all([
      this.db.query<DbProgress>("SELECT xp, level FROM user_progress WHERE user_id = $1", [userId]),
      this.db.query<DbCompletedTask>(
        "SELECT task_key, completed_at FROM user_completed_tasks WHERE user_id = $1 ORDER BY completed_at ASC",
        [userId]
      ),
    ]);

    const row = progressResult.rows[0];
    const completedTasks: TaskProgress[] = tasksResult.rows.map((r) => ({
      taskKey: r.taskKey,
      completedAt: r.completedAt,
    }));

    return { xp: row.xp, level: row.level, completedTasks };
  }

  /**
   * Mark a task as completed for the user and award its XP (idempotent).
   * Returns the updated XP/level and whether the user levelled up.
   */
  public async completeTask(userId: number, taskKey: string): Promise<CompleteTaskResponse> {
    const task = TASKS.find((t) => t.key === taskKey);
    if (!task) {
      throw new NotFoundException(`Unknown task key: ${taskKey}`);
    }

    await this.ensureProgressRow(userId);

    // Insert completion – if it already exists, do nothing
    const insertResult = await this.db.query<{ task_key: string }>(
      `INSERT INTO user_completed_tasks (user_id, task_key)
       VALUES ($1, $2)
       ON CONFLICT (user_id, task_key) DO NOTHING
       RETURNING task_key`,
      [userId, taskKey]
    );

    const wasInserted = insertResult.rows.length > 0;

    if (!wasInserted) {
      // Already completed – return current state without changes
      const current = await this.db.query<DbProgress>(
        "SELECT xp, level FROM user_progress WHERE user_id = $1",
        [userId]
      );
      const row = current.rows[0];
      return { xp: row.xp, level: row.level, leveledUp: false, xpGained: 0, newUnlockLevels: [] };
    }

    // Award XP and recalculate level atomically
    const updateResult = await this.db.query<DbProgress>(
      `UPDATE user_progress
       SET xp = xp + $1, updated_at = now()
       WHERE user_id = $2
       RETURNING xp, level`,
      [task.xpReward, userId]
    );

    const updated = updateResult.rows[0];
    const newLevel = xpToLevel(updated.xp);
    const oldLevel = updated.level;
    const leveledUp = newLevel > oldLevel;

    if (leveledUp) {
      await this.db.query("UPDATE user_progress SET level = $1 WHERE user_id = $2", [
        newLevel,
        userId,
      ]);
    }

    // Calculate which command-unlock levels are crossed
    const newUnlockLevels: number[] = [];
    if (leveledUp) {
      for (let l = oldLevel + 1; l <= newLevel; l++) {
        newUnlockLevels.push(l);
      }
    }

    this.logger.log(
      `User ${userId} completed task '${taskKey}' (+${task.xpReward} XP${leveledUp ? `, level up ${oldLevel}→${newLevel}` : ""})`
    );

    return {
      xp: updated.xp,
      level: newLevel,
      leveledUp,
      xpGained: task.xpReward,
      newUnlockLevels,
    };
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async ensureProgressRow(userId: number): Promise<void> {
    await this.db.query(
      "INSERT INTO user_progress (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
      [userId]
    );
  }
}

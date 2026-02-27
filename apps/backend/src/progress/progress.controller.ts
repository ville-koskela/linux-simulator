import {
  type CompleteTaskResponse,
  type UserProgress,
  completeTaskResponseSchema,
  userProgressSchema,
} from "@linux-simulator/shared";
import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import type { AuthUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/user.decorator";
// biome-ignore lint/style/useImportType: Needed by dependency injection
import { ProgressService } from "./progress.service";

@Controller("progress")
@UseGuards(AuthGuard)
export class ProgressController {
  public constructor(private readonly progressService: ProgressService) {}

  /** GET /progress – current XP, level and completed tasks */
  @Get()
  public async getProgress(@CurrentUser() user: AuthUser): Promise<UserProgress> {
    const progress = await this.progressService.getProgress(user.id);
    return userProgressSchema.parse(progress);
  }

  /** POST /progress/tasks/:key/complete – award XP for a task (idempotent) */
  @Post("tasks/:key/complete")
  public async completeTask(
    @CurrentUser() user: AuthUser,
    @Param("key") key: string
  ): Promise<CompleteTaskResponse> {
    const result = await this.progressService.completeTask(user.id, key);
    return completeTaskResponseSchema.parse(result);
  }
}

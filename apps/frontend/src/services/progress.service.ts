import {
  type CompleteTaskResponse,
  type UserProgress,
  completeTaskResponseSchema,
  userProgressSchema,
} from "@linux-simulator/shared";
import { apiFetch } from "./api.service";

export const ProgressApiService = {
  async getProgress(): Promise<UserProgress> {
    const data = await apiFetch<unknown>("/progress");
    return userProgressSchema.parse(data);
  },

  async completeTask(taskKey: string): Promise<CompleteTaskResponse> {
    const data = await apiFetch<unknown>(`/progress/tasks/${taskKey}/complete`, {
      method: "POST",
    });
    return completeTaskResponseSchema.parse(data);
  },
};

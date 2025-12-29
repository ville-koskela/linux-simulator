/** biome-ignore-all lint/nursery/useExplicitType: For now we don't type schemas explicitly */
import { z } from "zod";

// Health check response schema
export const healthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  service: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

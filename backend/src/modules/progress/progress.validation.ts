import { z } from "zod";

export const logProgressSchema = z.object({
  eventType: z.enum(["LESSON_OPENED", "LESSON_COMPLETED"]),
});

export type LogProgressInput = z.infer<typeof logProgressSchema>;

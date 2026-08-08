import { z } from "zod";

export const createModuleSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
});

export const createLessonSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  bodyText: z.string().optional(),
  videoUrl: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;

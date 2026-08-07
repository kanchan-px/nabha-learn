import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  gradeLevel: z.string().optional(),
  language: z.string().optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  gradeLevel: z.string().optional(),
  language: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

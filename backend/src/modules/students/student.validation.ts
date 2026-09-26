import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateStudentSchema = z.object({
  isActive: z.boolean().optional(),
  gradeLevel: z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]).optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

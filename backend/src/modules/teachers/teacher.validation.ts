import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  schoolId: z.string().uuid("A valid school must be selected"),
  email: z.string().email().optional(),
});

export const updateTeacherSchema = z.object({
  isActive: z.boolean().optional(),
  schoolId: z.string().uuid().optional(),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;

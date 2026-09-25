import { z } from "zod";

const gradeLevels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;

export const createTeacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  schoolId: z.string().uuid("A valid school must be selected"),
  gradeLevel: z.enum(gradeLevels, {
    error: "A valid grade level must be selected",
  }),
  email: z.string().email().optional(),
});

export const updateTeacherSchema = z.object({
  isActive: z.boolean().optional(),
  schoolId: z.string().uuid().optional(),
  gradeLevel: z.enum(gradeLevels).optional(),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;

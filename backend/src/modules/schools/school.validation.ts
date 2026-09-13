import { z } from "zod";

export const createSchoolSchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters"),
  udiseCode: z.string().optional(),
  district: z.string().min(2, "District is required"),
  state: z.string().optional(),
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;

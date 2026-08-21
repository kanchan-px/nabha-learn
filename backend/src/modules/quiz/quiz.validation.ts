import { z } from "zod";

const optionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  options: z
    .array(optionSchema)
    .min(2, "Each question needs at least 2 options")
    .refine(
      (options) => options.filter((o) => o.isCorrect).length === 1,
      "Each question must have exactly one correct option"
    ),
});

export const createQuizSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  questions: z.array(questionSchema).min(1, "Quiz needs at least 1 question"),
});

export const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      selectedOptionId: z.string().uuid(),
    })
  ),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;

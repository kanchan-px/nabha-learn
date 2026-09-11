import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { createQuizSchema, submitAttemptSchema } from "./quiz.validation";
import { createQuiz, getQuizForStudent, submitAttempt, getQuizForDownload } from "./quiz.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  const lessonId = req.params.lessonId as string;
  const parseResult = createQuizSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const quiz = await createQuiz(lessonId, parseResult.data);
    return res.status(201).json({ quiz });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(400).json({ error: message });
  }
}

export async function getForLesson(req: AuthenticatedRequest, res: Response) {
  const lessonId = req.params.lessonId as string;

  try {
    const quiz = await getQuizForStudent(lessonId);
    return res.status(200).json({ quiz });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(404).json({ error: message });
  }
}

export async function submit(req: AuthenticatedRequest, res: Response) {
  const lessonId = req.params.lessonId as string;
  const parseResult = submitAttemptSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const attempt = await submitAttempt(lessonId, req.user!.userId, parseResult.data);
    return res.status(201).json({ attempt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(400).json({ error: message });
  }
}

export async function getForDownload(req: AuthenticatedRequest, res: Response) {
  const lessonId = req.params.lessonId as string;
  const quiz = await getQuizForDownload(lessonId);
  return res.status(200).json({ quiz });
}

import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { logProgressSchema } from "./progress.validation";
import { logProgress, getCourseProgress } from "./progress.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  const lessonId = req.params.lessonId as string;
  const parseResult = logProgressSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const event = await logProgress(lessonId, req.user!.userId, parseResult.data);
    return res.status(201).json({ event });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(404).json({ error: message });
  }
}

export async function getForCourse(req: AuthenticatedRequest, res: Response) {
  const courseId = req.params.courseId as string;

  try {
    const progress = await getCourseProgress(courseId);
    return res.status(200).json(progress);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(404).json({ error: message });
  }
}

import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { createModuleSchema, createLessonSchema } from "./curriculum.validation";
import { createModule, createLesson } from "./curriculum.service";

export async function addModule(req: AuthenticatedRequest, res: Response) {
  const courseId = req.params.courseId as string;
  const parseResult = createModuleSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const module = await createModule(courseId, parseResult.data);
    return res.status(201).json({ module });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(404).json({ error: message });
  }
}

export async function addLesson(req: AuthenticatedRequest, res: Response) {
  const moduleId = req.params.moduleId as string;
  const parseResult = createLessonSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const lesson = await createLesson(moduleId, parseResult.data);
    return res.status(201).json({ lesson });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(404).json({ error: message });
  }
}

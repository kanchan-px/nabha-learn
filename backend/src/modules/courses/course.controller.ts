import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { createCourseSchema, updateCourseSchema } from "./course.validation";
import { createCourse, listCourses, getCourseById, updateCourse } from "./course.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  const parseResult = createCourseSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const course = await createCourse(parseResult.data, req.user!.userId);
    return res.status(201).json({ course });
  } catch {
    return res.status(500).json({ error: "Failed to create course" });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  const courses = await listCourses(req.user!.role);
  return res.status(200).json({ courses });
}

export async function getOne(req: AuthenticatedRequest, res: Response) {
  const courseId = req.params.courseId as string;

  try {
    const course = await getCourseById(courseId, req.user!.role);
    return res.status(200).json({ course });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(404).json({ error: message });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const courseId = req.params.courseId as string;
  const parseResult = updateCourseSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const course = await updateCourse(courseId, parseResult.data);
    return res.status(200).json({ course });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(404).json({ error: message });
  }
}

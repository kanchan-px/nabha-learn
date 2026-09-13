import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { createTeacherSchema, updateTeacherSchema } from "./teacher.validation";
import { createTeacher, listTeachers, updateTeacher } from "./teacher.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  const parseResult = createTeacherSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const teacher = await createTeacher(parseResult.data);
    return res.status(201).json({
      teacher,
      generatedPassword: parseResult.data.password,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create teacher";
    return res.status(400).json({ error: message });
  }
}

export async function list(_req: AuthenticatedRequest, res: Response) {
  const teachers = await listTeachers();
  return res.status(200).json({ teachers });
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const teacherId = req.params.teacherId as string;
  const parseResult = updateTeacherSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const teacher = await updateTeacher(teacherId, parseResult.data);
    return res.status(200).json({ teacher });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(404).json({ error: message });
  }
}

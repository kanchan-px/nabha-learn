import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { createStudentSchema, updateStudentSchema } from "./student.validation";
import { createStudent, listStudents, updateStudent } from "./student.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  const parseResult = createStudentSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const student = await createStudent(parseResult.data, req.user!.userId);
    return res.status(201).json({
      student,
      generatedPassword: parseResult.data.password,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create student";
    return res.status(400).json({ error: message });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  const students = await listStudents(req.user!.userId);
  return res.status(200).json({ students });
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const studentId = req.params.studentId as string;
  const parseResult = updateStudentSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const student = await updateStudent(studentId, parseResult.data, req.user!.userId);
    return res.status(200).json({ student });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(403).json({ error: message });
  }
}

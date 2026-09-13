import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { createSchoolSchema } from "./school.validation";
import { createSchool, listSchools } from "./school.service";

export async function create(req: AuthenticatedRequest, res: Response) {
  const parseResult = createSchoolSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const school = await createSchool(parseResult.data);
    return res.status(201).json({ school });
  } catch {
    return res.status(500).json({ error: "Failed to create school" });
  }
}

export async function list(_req: AuthenticatedRequest, res: Response) {
  const schools = await listSchools();
  return res.status(200).json({ schools });
}

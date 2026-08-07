import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.validation";
import { registerUser, loginUser } from "./auth.service";
import { AuthenticatedRequest } from "../../middleware/authenticate";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getMe(req: AuthenticatedRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, username: true, role: true, email: true },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json({ user });
}

export async function register(req: Request, res: Response) {
  const parseResult = registerSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const { user, token } = await registerUser(parseResult.data);
    return res.status(201).json({
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
      token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(400).json({ error: message });
  }
}

export async function login(req: Request, res: Response) {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues[0].message });
  }

  try {
    const { user, token } = await loginUser(parseResult.data);
    return res.status(200).json({
      user: { id: user.id, name: user.name, username: user.username, role: user.role },
      token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return res.status(400).json({ error: message });
  }
}

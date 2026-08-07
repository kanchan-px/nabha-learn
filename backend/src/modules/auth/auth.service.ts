import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { RegisterInput, LoginInput } from "./auth.validation";

const prisma = new PrismaClient();

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { username: data.username },
  });

  if (existingUser) {
    throw new Error("Username already taken");
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash,
      role: data.role,
      schoolId: data.schoolId,
    },
  });

  const token = generateToken({ userId: user.id, role: user.role });

  return { user, token };
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { username: data.username },
  });

  if (!user) {
    throw new Error("Invalid username or password");
  }

  const isPasswordValid = await comparePassword(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid username or password");
  }

  const token = generateToken({ userId: user.id, role: user.role });

  return { user, token };
}

import { PrismaClient } from "@prisma/client";
import { comparePassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { LoginInput } from "./auth.validation";

const prisma = new PrismaClient();

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { username: data.username },
  });

  if (!user) {
    throw new Error("Invalid username or password");
  }

  if (!user.isActive) {
    throw new Error("This account has been disabled");
  }

  const isPasswordValid = await comparePassword(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid username or password");
  }

  const token = generateToken({ userId: user.id, role: user.role });

  return { user, token };
}

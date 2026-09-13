import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../utils/password";
import { CreateTeacherInput, UpdateTeacherInput } from "./teacher.validation";

const prisma = new PrismaClient();

async function generateTeacherUsername(): Promise<string> {
  const existingTeachers = await prisma.user.findMany({
    where: { role: "TEACHER", username: { startsWith: "NABHA-T" } },
    select: { username: true },
  });

  const numbers = existingTeachers
    .map((t) => parseInt(t.username.replace("NABHA-T", ""), 10))
    .filter((n) => !isNaN(n));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `NABHA-T${String(nextNumber).padStart(3, "0")}`;
}

export async function createTeacher(data: CreateTeacherInput) {
  const school = await prisma.school.findUnique({ where: { id: data.schoolId } });
  if (!school) {
    throw new Error("School not found");
  }

  const username = await generateTeacherUsername();
  const passwordHash = await hashPassword(data.password);

  const teacher = await prisma.user.create({
    data: {
      name: data.name,
      username,
      email: data.email,
      passwordHash,
      role: "TEACHER",
      schoolId: data.schoolId,
      isActive: true,
    },
  });

  return {
    id: teacher.id,
    name: teacher.name,
    username: teacher.username,
    schoolId: teacher.schoolId,
    isActive: teacher.isActive,
  };
}

export async function listTeachers() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    select: {
      id: true,
      name: true,
      username: true,
      isActive: true,
      schoolId: true,
      school: { select: { name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return teachers;
}

export async function updateTeacher(teacherId: string, data: UpdateTeacherInput) {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });

  if (!teacher || teacher.role !== "TEACHER") {
    throw new Error("Teacher not found");
  }

  return prisma.user.update({
    where: { id: teacherId },
    data,
    select: {
      id: true,
      name: true,
      username: true,
      isActive: true,
      schoolId: true,
    },
  });
}

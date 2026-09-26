import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../utils/password";
import { CreateStudentInput, UpdateStudentInput } from "./student.validation";

const prisma = new PrismaClient();

async function generateStudentUsername(): Promise<string> {
  const existingStudents = await prisma.user.findMany({
    where: { role: "STUDENT", username: { startsWith: "NABHA-S" } },
    select: { username: true },
  });

  const numbers = existingStudents
    .map((s) => parseInt(s.username.replace("NABHA-S", ""), 10))
    .filter((n) => !isNaN(n));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `NABHA-S${String(nextNumber).padStart(3, "0")}`;
}

export async function createStudent(data: CreateStudentInput, teacherId: string) {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });

  if (!teacher || !teacher.schoolId || !teacher.gradeLevel) {
    throw new Error("Teacher must have an assigned school and grade to create students");
  }

  const username = await generateStudentUsername();
  const passwordHash = await hashPassword(data.password);

  const student = await prisma.user.create({
    data: {
      name: data.name,
      username,
      passwordHash,
      role: "STUDENT",
      schoolId: teacher.schoolId,
      gradeLevel: teacher.gradeLevel,
      isActive: true,
    },
  });

  return {
    id: student.id,
    name: student.name,
    username: student.username,
    schoolId: student.schoolId,
    gradeLevel: student.gradeLevel,
    isActive: student.isActive,
  };
}

export async function listStudents(teacherId: string) {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });

  if (!teacher?.schoolId || !teacher?.gradeLevel) {
    return [];
  }

  return prisma.user.findMany({
    where: {
      role: "STUDENT",
      schoolId: teacher.schoolId,
      gradeLevel: teacher.gradeLevel,
    },
    select: {
      id: true,
      name: true,
      username: true,
      isActive: true,
      gradeLevel: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateStudent(
  studentId: string,
  data: UpdateStudentInput,
  teacherId: string
) {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  const student = await prisma.user.findUnique({ where: { id: studentId } });

  if (!student || student.role !== "STUDENT") {
    throw new Error("Student not found");
  }

  if (!teacher?.schoolId || student.schoolId !== teacher.schoolId) {
    throw new Error("You do not have permission to modify this student");
  }

  return prisma.user.update({
    where: { id: studentId },
    data,
    select: {
      id: true,
      name: true,
      username: true,
      isActive: true,
      gradeLevel: true,
    },
  });
}

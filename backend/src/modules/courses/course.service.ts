import { PrismaClient } from "@prisma/client";
import { CreateCourseInput, UpdateCourseInput } from "./course.validation";

const prisma = new PrismaClient();

export async function createCourse(data: CreateCourseInput, createdById: string) {
  return prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      gradeLevel: data.gradeLevel,
      language: data.language,
      createdById,
    },
  });
}

export async function listCourses(userRole: string) {
  if (userRole === "STUDENT") {
    return prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.course.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourseById(courseId: string, userRole: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (userRole === "STUDENT" && !course.isPublished) {
    throw new Error("Course not found");
  }

  return course;
}

export async function updateCourse(courseId: string, data: UpdateCourseInput) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    throw new Error("Course not found");
  }

  return prisma.course.update({
    where: { id: courseId },
    data,
  });
}

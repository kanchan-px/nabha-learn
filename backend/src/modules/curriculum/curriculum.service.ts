import { PrismaClient } from "@prisma/client";
import { CreateModuleInput, CreateLessonInput } from "./curriculum.validation";

const prisma = new PrismaClient();

export async function createModule(courseId: string, data: CreateModuleInput) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    throw new Error("Course not found");
  }

  const moduleCount = await prisma.module.count({ where: { courseId } });

  return prisma.module.create({
    data: {
      title: data.title,
      order: moduleCount + 1,
      courseId,
    },
  });
}

export async function createLesson(moduleId: string, data: CreateLessonInput) {
  const module = await prisma.module.findUnique({ where: { id: moduleId } });

  if (!module) {
    throw new Error("Module not found");
  }

  const lessonCount = await prisma.lesson.count({ where: { moduleId } });

  return prisma.lesson.create({
    data: {
      title: data.title,
      bodyText: data.bodyText,
      videoUrl: data.videoUrl,
      pdfUrl: data.pdfUrl,
      order: lessonCount + 1,
      moduleId,
    },
  });
}

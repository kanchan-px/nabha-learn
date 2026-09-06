import { PrismaClient } from "@prisma/client";
import { LogProgressInput } from "./progress.validation";

const prisma = new PrismaClient();

export async function logProgress(lessonId: string, studentId: string, data: LogProgressInput) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  return prisma.progressEvent.create({
    data: {
      lessonId,
      studentId,
      eventType: data.eventType,
    },
  });
}

export async function getCourseProgress(courseId: string) {
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

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, username: true },
  });

  const allEvents = await prisma.progressEvent.findMany({
    where: { lessonId: { in: lessonIds } },
    orderBy: { createdAt: "desc" },
  });

  const progressGrid = students.map((student) => {
    const lessonStatuses = lessonIds.map((lessonId) => {
      const latestEvent = allEvents.find(
        (e) => e.studentId === student.id && e.lessonId === lessonId
      );

      return {
        lessonId,
        status: latestEvent ? latestEvent.eventType : "NOT_STARTED",
      };
    });

    return {
      student,
      lessonStatuses,
    };
  });

  return {
    course: { id: course.id, title: course.title },
    lessonIds,
    progressGrid,
  };
}

export async function getLessonStatus(lessonId: string, studentId: string) {
  const latestEvent = await prisma.progressEvent.findFirst({
    where: { lessonId, studentId },
    orderBy: { createdAt: "desc" },
  });

  return { status: latestEvent ? latestEvent.eventType : "NOT_STARTED" };
}

import { PrismaClient } from "@prisma/client";
import { CreateCourseInput, UpdateCourseInput } from "./course.validation";

const prisma = new PrismaClient();

export async function createCourse(data: CreateCourseInput, createdById: string) {
  const teacher = await prisma.user.findUnique({ where: { id: createdById } });

  if (!teacher?.schoolId || !teacher?.gradeLevel) {
    throw new Error("Teacher must have an assigned school and grade to create courses");
  }

  return prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      gradeLevel: teacher.gradeLevel,
      language: data.language,
      createdById,
    },
  });
}

async function canAccessCourse(
  courseId: string,
  userId: string,
  userRole: string
): Promise<boolean> {
  if (userRole === "ADMIN") return true;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { gradeLevel: true, createdBy: { select: { schoolId: true } } },
  });

  if (!course) return false;

  const requestingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { schoolId: true, gradeLevel: true },
  });

  if (!requestingUser?.schoolId || !course.createdBy.schoolId) return false;
  if (requestingUser.schoolId !== course.createdBy.schoolId) return false;
  if (requestingUser.gradeLevel !== course.gradeLevel) return false;

  return true;
}

export async function listCourses(userId: string, userRole: string) {
  if (userRole === "STUDENT") {
    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: { schoolId: true, gradeLevel: true },
    });

    if (!student?.schoolId || !student?.gradeLevel) {
      return [];
    }

    return prisma.course.findMany({
      where: {
        isPublished: true,
        gradeLevel: student.gradeLevel,
        createdBy: { schoolId: student.schoolId },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (userRole === "ADMIN") {
    return listCoursesWithCounts({});
  }

  const requestingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { schoolId: true, gradeLevel: true },
  });

  if (!requestingUser?.schoolId || !requestingUser?.gradeLevel) {
    return [];
  }

  return listCoursesWithCounts({
    gradeLevel: requestingUser.gradeLevel,
    createdBy: { schoolId: requestingUser.schoolId },
  });
}

async function listCoursesWithCounts(where: object) {
  const courses = await prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      modules: { select: { _count: { select: { lessons: true } } } },
    },
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    gradeLevel: course.gradeLevel,
    language: course.language,
    isPublished: course.isPublished,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    createdById: course.createdById,
    moduleCount: course.modules.length,
    lessonCount: course.modules.reduce((total, m) => total + m._count.lessons, 0),
  }));
}

export async function getCourseById(courseId: string, userId: string, userRole: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
      createdBy: { select: { schoolId: true } },
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  if (userRole === "STUDENT") {
    if (!course.isPublished) {
      throw new Error("Course not found");
    }

    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: { schoolId: true, gradeLevel: true },
    });

    if (
      !student?.schoolId ||
      !student?.gradeLevel ||
      student.schoolId !== course.createdBy.schoolId ||
      student.gradeLevel !== course.gradeLevel
    ) {
      throw new Error("Course not found");
    }
  }

  if (userRole === "TEACHER") {
    const hasAccess = await canAccessCourse(courseId, userId, userRole);
    if (!hasAccess) {
      throw new Error("Course not found");
    }
  }

  return course;
}

export async function updateCourse(
  courseId: string,
  data: UpdateCourseInput,
  userId: string,
  userRole: string
) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    throw new Error("Course not found");
  }

  const hasAccess = await canAccessCourse(courseId, userId, userRole);
  if (!hasAccess) {
    throw new Error("You do not have permission to modify this course");
  }

  return prisma.course.update({
    where: { id: courseId },
    data,
  });
}

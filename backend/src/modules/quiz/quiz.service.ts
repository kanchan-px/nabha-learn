import { PrismaClient } from "@prisma/client";
import { CreateQuizInput, SubmitAttemptInput } from "./quiz.validation";

const prisma = new PrismaClient();

export async function createQuiz(lessonId: string, data: CreateQuizInput) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const existingQuiz = await prisma.quiz.findUnique({ where: { lessonId } });

  if (existingQuiz) {
    throw new Error("This lesson already has a quiz");
  }

  return prisma.quiz.create({
    data: {
      title: data.title,
      lessonId,
      questions: {
        create: data.questions.map((question, index) => ({
          text: question.text,
          order: index + 1,
          options: {
            create: question.options.map((option) => ({
              text: option.text,
              isCorrect: option.isCorrect,
            })),
          },
        })),
      },
    },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });
}

export async function getQuizForStudent(lessonId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { lessonId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            select: { id: true, text: true },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found for this lesson");
  }

  return quiz;
}

export async function submitAttempt(lessonId: string, studentId: string, data: SubmitAttemptInput) {
  const quiz = await prisma.quiz.findUnique({
    where: { lessonId },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz not found for this lesson");
  }

  let score = 0;
  const totalMarks = quiz.questions.length;

  for (const question of quiz.questions) {
    const studentAnswer = data.answers.find((a) => a.questionId === question.id);
    const correctOption = question.options.find((o) => o.isCorrect);

    if (studentAnswer && correctOption && studentAnswer.selectedOptionId === correctOption.id) {
      score += 1;
    }
  }

  return prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      studentId,
      score,
      totalMarks,
    },
  });
}

export async function getQuizForDownload(lessonId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { lessonId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: true },
      },
    },
  });

  return quiz;
}

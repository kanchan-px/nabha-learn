import { getDb } from "./schema";
import type { Course, Module, Lesson } from "../api/courses.api";

export async function getOfflineCourses(): Promise<Course[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: string;
    title: string;
    description: string;
  }>(`SELECT id, title, description FROM downloaded_courses`);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description || null,
    gradeLevel: null,
    language: "en",
    isPublished: true,
    createdAt: "",
  }));
}

export async function getOfflineCourseById(courseId: string): Promise<Course | null> {
  const db = await getDb();

  const courseRow = await db.getFirstAsync<{ id: string; title: string; description: string }>(
    `SELECT id, title, description FROM downloaded_courses WHERE id = ?`,
    [courseId]
  );

  if (!courseRow) return null;

  const moduleRows = await db.getAllAsync<{ id: string; title: string; order_index: number }>(
    `SELECT id, title, order_index FROM downloaded_modules WHERE course_id = ? ORDER BY order_index ASC`,
    [courseId]
  );

  console.log("MODULE ROWS:", JSON.stringify(moduleRows));

  const modules: Module[] = [];

  for (const moduleRow of moduleRows) {
    const lessonRows = await db.getAllAsync<{
      id: string;
      title: string;
      order_index: number;
      body_text: string;
    }>(
      `SELECT id, title, order_index, body_text FROM downloaded_lessons WHERE module_id = ? ORDER BY order_index ASC`,
      [moduleRow.id]
    );

    const lessons: Lesson[] = lessonRows.map((l) => ({
      id: l.id,
      title: l.title,
      order: l.order_index,
      bodyText: l.body_text || null,
      videoUrl: null,
      pdfUrl: null,
    }));

    modules.push({
      id: moduleRow.id,
      title: moduleRow.title,
      order: moduleRow.order_index,
      lessons,
    });
  }

  return {
    id: courseRow.id,
    title: courseRow.title,
    description: courseRow.description || null,
    gradeLevel: null,
    language: "en",
    isPublished: true,
    createdAt: "",
    modules,
  };
}

export interface OfflineQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface OfflineQuizQuestion {
  id: string;
  text: string;
  options: OfflineQuizOption[];
}

export interface OfflineQuiz {
  id: string;
  title: string;
  questions: OfflineQuizQuestion[];
}

export async function getOfflineQuizForLesson(lessonId: string): Promise<OfflineQuiz | null> {
  const db = await getDb();

  const quizRow = await db.getFirstAsync<{ id: string; title: string }>(
    `SELECT id, title FROM downloaded_quizzes WHERE lesson_id = ?`,
    [lessonId]
  );

  if (!quizRow) return null;

  const questionRows = await db.getAllAsync<{ id: string; text: string }>(
    `SELECT id, text FROM downloaded_questions WHERE quiz_id = ?`,
    [quizRow.id]
  );

  const questions: OfflineQuizQuestion[] = [];

  for (const q of questionRows) {
    const optionRows = await db.getAllAsync<{ id: string; text: string; is_correct: number }>(
      `SELECT id, text, is_correct FROM downloaded_options WHERE question_id = ?`,
      [q.id]
    );

    questions.push({
      id: q.id,
      text: q.text,
      options: optionRows.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.is_correct === 1,
      })),
    });
  }

  return { id: quizRow.id, title: quizRow.title, questions };
}
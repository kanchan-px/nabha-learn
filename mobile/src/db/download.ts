import { getDb } from "./schema";
import { getCourseById } from "../api/courses.api";
import { getQuizForDownload } from "../api/quiz.api";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getCurrentStudentId(): Promise<string> {
  const savedUser = await AsyncStorage.getItem("user");
  if (!savedUser) throw new Error("No logged-in user found");
  return JSON.parse(savedUser).id;
}

export async function downloadCourse(courseId: string): Promise<void> {
  const studentId = await getCurrentStudentId();
  const course = await getCourseById(courseId);
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO downloaded_courses (id, student_id, title, description, downloaded_at)
       VALUES (?, ?, ?, ?, ?)`,
      [course.id, studentId, course.title, course.description ?? "", new Date().toISOString()]
    );

    for (const courseModule of course.modules ?? []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO downloaded_modules (id, course_id, student_id, title, order_index)
         VALUES (?, ?, ?, ?, ?)`,
        [courseModule.id, course.id, studentId, courseModule.title, courseModule.order]
      );

      for (const lesson of courseModule.lessons) {
        await db.runAsync(
          `INSERT OR REPLACE INTO downloaded_lessons (id, module_id, student_id, title, order_index, body_text)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [lesson.id, courseModule.id, studentId, lesson.title, lesson.order, lesson.bodyText ?? ""]
        );

        const quiz = await getQuizForDownload(lesson.id);
        if (quiz) {
          await db.runAsync(
            `INSERT OR REPLACE INTO downloaded_quizzes (id, lesson_id, student_id, title) VALUES (?, ?, ?, ?)`,
            [quiz.id, lesson.id, studentId, quiz.title]
          );

          for (const question of quiz.questions) {
            await db.runAsync(
              `INSERT OR REPLACE INTO downloaded_questions (id, quiz_id, student_id, text) VALUES (?, ?, ?, ?)`,
              [question.id, quiz.id, studentId, question.text]
            );

            for (const option of question.options) {
              const isCorrect = option.isCorrect ? 1 : 0;
              await db.runAsync(
                `INSERT OR REPLACE INTO downloaded_options (id, question_id, student_id, text, is_correct)
                 VALUES (?, ?, ?, ?, ?)`,
                [option.id, question.id, studentId, option.text, isCorrect]
              );
            }
          }
        }
      }
    }
  });
}

export async function isCourseDownloaded(courseId: string): Promise<boolean> {
  const studentId = await getCurrentStudentId();
  const db = await getDb();
  const result = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM downloaded_courses WHERE id = ? AND student_id = ?`,
    [courseId, studentId]
  );
  return !!result;
}
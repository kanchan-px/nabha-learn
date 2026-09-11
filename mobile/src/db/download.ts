import { getDb } from "./schema";
import { getCourseById } from "../api/courses.api";
import { getQuizForLesson } from "../api/quiz.api";

export async function downloadCourse(courseId: string): Promise<void> {
  const course = await getCourseById(courseId);
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO downloaded_courses (id, title, description, downloaded_at)
       VALUES (?, ?, ?, ?)`,
      [course.id, course.title, course.description ?? "", new Date().toISOString()]
    );

    for (const courseModule of course.modules ?? []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO downloaded_modules (id, course_id, title, order_index)
         VALUES (?, ?, ?, ?)`,
        [courseModule.id, course.id, courseModule.title, courseModule.order]
      );

      for (const lesson of courseModule.lessons) {
        await db.runAsync(
          `INSERT OR REPLACE INTO downloaded_lessons (id, module_id, title, order_index, body_text)
           VALUES (?, ?, ?, ?, ?)`,
          [lesson.id, courseModule.id, lesson.title, lesson.order, lesson.bodyText ?? ""]
        );

        const quiz = await getQuizForLesson(lesson.id);
        if (quiz) {
          await db.runAsync(
            `INSERT OR REPLACE INTO downloaded_quizzes (id, lesson_id, title) VALUES (?, ?, ?)`,
            [quiz.id, lesson.id, quiz.title]
          );

          for (const question of quiz.questions) {
            await db.runAsync(
              `INSERT OR REPLACE INTO downloaded_questions (id, quiz_id, text) VALUES (?, ?, ?)`,
              [question.id, quiz.id, question.text]
            );

            for (const option of question.options) {
              const isCorrect = "isCorrect" in option ? (option.isCorrect ? 1 : 0) : 0;
              await db.runAsync(
                `INSERT OR REPLACE INTO downloaded_options (id, question_id, text, is_correct)
                 VALUES (?, ?, ?, ?)`,
                [option.id, question.id, option.text, isCorrect]
              );
            }
          }
        }
      }
    }
  });
}

export async function isCourseDownloaded(courseId: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM downloaded_courses WHERE id = ?`,
    [courseId]
  );
  return !!result;
}
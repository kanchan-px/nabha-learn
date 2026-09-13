import { getDb } from "./schema";
import * as Crypto from "expo-crypto";

export async function saveOfflineQuizAttempt(
  lessonId: string,
  score: number,
  totalMarks: number
) {
  const db = await getDb();
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO pending_quiz_attempts (id, lesson_id, score, total_marks, created_at, synced)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [id, lessonId, score, totalMarks, new Date().toISOString()]
  );
}
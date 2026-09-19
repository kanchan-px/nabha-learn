import { getDb } from "./schema";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getCurrentStudentId(): Promise<string> {
  const savedUser = await AsyncStorage.getItem("user");
  if (!savedUser) throw new Error("No logged-in user found");
  return JSON.parse(savedUser).id;
}

export async function saveOfflineQuizAttempt(lessonId: string, score: number, totalMarks: number) {
  const studentId = await getCurrentStudentId();
  const db = await getDb();
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO pending_quiz_attempts (id, lesson_id, student_id, score, total_marks, created_at, synced)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [id, lessonId, studentId, score, totalMarks, new Date().toISOString()]
  );
}
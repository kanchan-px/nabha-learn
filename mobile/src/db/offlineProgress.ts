import { getDb } from "./schema";
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getCurrentStudentId(): Promise<string> {
  const savedUser = await AsyncStorage.getItem("user");
  if (!savedUser) throw new Error("No logged-in user found");
  return JSON.parse(savedUser).id;
}

export async function saveOfflineProgressEvent(
  lessonId: string,
  eventType: "LESSON_OPENED" | "LESSON_COMPLETED"
) {
  const studentId = await getCurrentStudentId();
  const db = await getDb();
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO pending_progress_events (id, lesson_id, student_id, event_type, created_at, synced)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [id, lessonId, studentId, eventType, new Date().toISOString()]
  );
}

export async function getOfflineLessonStatus(
  lessonId: string
): Promise<"NOT_STARTED" | "LESSON_OPENED" | "LESSON_COMPLETED"> {
  const studentId = await getCurrentStudentId();
  const db = await getDb();

  const rows = await db.getAllAsync<{ event_type: string }>(
    `SELECT event_type FROM pending_progress_events WHERE lesson_id = ? AND student_id = ?`,
    [lessonId, studentId]
  );

  const hasCompleted = rows.some((r) => r.event_type === "LESSON_COMPLETED");
  const hasOpened = rows.some((r) => r.event_type === "LESSON_OPENED");

  return hasCompleted ? "LESSON_COMPLETED" : hasOpened ? "LESSON_OPENED" : "NOT_STARTED";
}
import { getDb } from "./schema";
import * as Crypto from "expo-crypto";

export async function saveOfflineProgressEvent(
  lessonId: string,
  eventType: "LESSON_OPENED" | "LESSON_COMPLETED"
) {
  const db = await getDb();
  const id = Crypto.randomUUID();

  await db.runAsync(
    `INSERT INTO pending_progress_events (id, lesson_id, event_type, created_at, synced)
     VALUES (?, ?, ?, ?, 0)`,
    [id, lessonId, eventType, new Date().toISOString()]
  );
}

export async function getOfflineLessonStatus(
  lessonId: string
): Promise<"NOT_STARTED" | "LESSON_OPENED" | "LESSON_COMPLETED"> {
  const db = await getDb();

  const row = await db.getFirstAsync<{ event_type: string }>(
  `SELECT event_type FROM pending_progress_events
   WHERE lesson_id = ?
   AND event_type = 'LESSON_COMPLETED'
   ORDER BY created_at DESC
   LIMIT 1`,
  [lessonId]
);

return row ? "LESSON_COMPLETED" : "NOT_STARTED";
}
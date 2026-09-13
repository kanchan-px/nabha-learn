import { getDb } from "./schema";
import apiClient from "../api/client";

interface PendingProgressRow {
  id: string;
  lesson_id: string;
  event_type: string;
}

interface PendingQuizAttemptRow {
  id: string;
  lesson_id: string;
  score: number;
  total_marks: number;
}

export async function syncPendingData(): Promise<{ synced: number; failed: number }> {
  const db = await getDb();
  let synced = 0;
  let failed = 0;

  const pendingProgress = await db.getAllAsync<PendingProgressRow>(
    `SELECT id, lesson_id, event_type FROM pending_progress_events WHERE synced = 0`
  );

  for (const row of pendingProgress) {
    try {
      await apiClient.post(`/lessons/${row.lesson_id}/progress`, {
        eventType: row.event_type,
      });
      await db.runAsync(`UPDATE pending_progress_events SET synced = 1 WHERE id = ?`, [row.id]);
      synced += 1;
    } catch {
      failed += 1;
    }
  }

  const pendingAttempts = await db.getAllAsync<PendingQuizAttemptRow>(
    `SELECT id, lesson_id, score, total_marks FROM pending_quiz_attempts WHERE synced = 0`
  );

  for (const row of pendingAttempts) {
    try {
      await apiClient.post(`/lessons/${row.lesson_id}/quiz/submit-offline-result`, {
        score: row.score,
        totalMarks: row.total_marks,
      });
      await db.runAsync(`UPDATE pending_quiz_attempts SET synced = 1 WHERE id = ?`, [row.id]);
      synced += 1;
    } catch {
      failed += 1;
    }
  }

  return { synced, failed };
}
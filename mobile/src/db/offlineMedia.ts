import { getDb } from "./schema";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getCurrentStudentId(): Promise<string> {
  const savedUser = await AsyncStorage.getItem("user");
  if (!savedUser) throw new Error("No logged-in user found");
  return JSON.parse(savedUser).id;
}

export type MediaType = "video" | "pdf";
export type MediaStatus = "downloading" | "downloaded" | "failed";

export interface MediaRecord {
  lessonId: string;
  mediaType: MediaType;
  remoteUrl: string;
  localUri: string | null;
  status: MediaStatus;
  fileSize: number | null;
  sourceUpdatedAt: string | null;
  downloadedAt: string | null;
}

export async function getMediaRecord(
  lessonId: string,
  mediaType: MediaType
): Promise<MediaRecord | null> {
  const studentId = await getCurrentStudentId();
  const db = await getDb();

  const row = await db.getFirstAsync<{
    lesson_id: string;
    media_type: string;
    remote_url: string;
    local_uri: string | null;
    status: string;
    file_size: number | null;
    source_updated_at: string | null;
    downloaded_at: string | null;
  }>(
    `SELECT lesson_id, media_type, remote_url, local_uri, status, file_size, source_updated_at, downloaded_at
     FROM downloaded_media WHERE lesson_id = ? AND student_id = ? AND media_type = ?`,
    [lessonId, studentId, mediaType]
  );

  if (!row) return null;

  return {
    lessonId: row.lesson_id,
    mediaType: row.media_type as MediaType,
    remoteUrl: row.remote_url,
    localUri: row.local_uri,
    status: row.status as MediaStatus,
    fileSize: row.file_size,
    sourceUpdatedAt: row.source_updated_at,
    downloadedAt: row.downloaded_at,
  };
}

export async function markDownloading(
  lessonId: string,
  mediaType: MediaType,
  remoteUrl: string,
  sourceUpdatedAt: string | null
) {
  const studentId = await getCurrentStudentId();
  const db = await getDb();

  await db.runAsync(
    `INSERT OR REPLACE INTO downloaded_media
     (lesson_id, student_id, media_type, remote_url, local_uri, status, file_size, source_updated_at, downloaded_at)
     VALUES (?, ?, ?, ?, NULL, 'downloading', NULL, ?, NULL)`,
    [lessonId, studentId, mediaType, remoteUrl, sourceUpdatedAt]
  );
}

export async function markDownloaded(
  lessonId: string,
  mediaType: MediaType,
  localUri: string,
  fileSize: number
) {
  const studentId = await getCurrentStudentId();
  const db = await getDb();

  await db.runAsync(
    `UPDATE downloaded_media
     SET status = 'downloaded', local_uri = ?, file_size = ?, downloaded_at = ?
     WHERE lesson_id = ? AND student_id = ? AND media_type = ?`,
    [localUri, fileSize, new Date().toISOString(), lessonId, studentId, mediaType]
  );
}

export async function markFailed(lessonId: string, mediaType: MediaType) {
  const studentId = await getCurrentStudentId();
  const db = await getDb();

  await db.runAsync(
    `UPDATE downloaded_media SET status = 'failed' WHERE lesson_id = ? AND student_id = ? AND media_type = ?`,
    [lessonId, studentId, mediaType]
  );
}

export async function deleteMedia(lessonId: string, mediaType: MediaType) {
  const studentId = await getCurrentStudentId();
  const db = await getDb();

  const record = await getMediaRecord(lessonId, mediaType);

  if (record?.localUri) {
    try {
      const { File } = await import("expo-file-system");
      const file = new File(record.localUri);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // File already gone — safe to ignore, we're deleting the record regardless.
    }
  }

  await db.runAsync(
    `DELETE FROM downloaded_media WHERE lesson_id = ? AND student_id = ? AND media_type = ?`,
    [lessonId, studentId, mediaType]
  );
}
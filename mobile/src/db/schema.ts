import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync("nabhalearn.db");
  return dbInstance;
}

export async function initDatabase() {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS downloaded_courses (
      id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      downloaded_at TEXT NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE IF NOT EXISTS downloaded_modules (
      id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE IF NOT EXISTS downloaded_lessons (
      id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      body_text TEXT,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE IF NOT EXISTS downloaded_quizzes (
      id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE IF NOT EXISTS downloaded_questions (
      id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      text TEXT NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE IF NOT EXISTS downloaded_options (
      id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      text TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE IF NOT EXISTS pending_progress_events (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pending_quiz_attempts (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_marks INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS downloaded_media (
      lesson_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      media_type TEXT NOT NULL,
      remote_url TEXT NOT NULL,
      local_uri TEXT,
      status TEXT NOT NULL,
      file_size INTEGER,
      source_updated_at TEXT,
      downloaded_at TEXT,
      PRIMARY KEY (lesson_id, student_id, media_type)
    );
  `);

  await reconcileStuckDownloads(db);

  return db;
}

async function reconcileStuckDownloads(db: SQLite.SQLiteDatabase) {
  const stuckRows = await db.getAllAsync<{
    lesson_id: string;
    student_id: string;
    media_type: string;
    local_uri: string | null;
  }>(`SELECT lesson_id, student_id, media_type, local_uri FROM downloaded_media WHERE status = 'downloading'`);

  for (const row of stuckRows) {
    if (row.local_uri) {
      try {
        const { File } = await import("expo-file-system");
        const file = new File(row.local_uri);
        if (file.exists) {
          file.delete();
        }
      } catch {
        // File may not exist or already be gone — safe to ignore here.
      }
    }

    await db.runAsync(
      `DELETE FROM downloaded_media WHERE lesson_id = ? AND student_id = ? AND media_type = ?`,
      [row.lesson_id, row.student_id, row.media_type]
    );
  }
}
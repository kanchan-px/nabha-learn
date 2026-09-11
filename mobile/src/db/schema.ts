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
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      downloaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS downloaded_modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS downloaded_lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      body_text TEXT
    );

    CREATE TABLE IF NOT EXISTS downloaded_quizzes (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS downloaded_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      text TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS downloaded_options (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      text TEXT NOT NULL,
      is_correct INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pending_progress_events (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pending_quiz_attempts (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_marks INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);

  return db;
}
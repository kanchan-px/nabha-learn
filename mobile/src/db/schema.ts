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

    DROP TABLE IF EXISTS downloaded_courses;
    DROP TABLE IF EXISTS downloaded_modules;
    DROP TABLE IF EXISTS downloaded_lessons;
    DROP TABLE IF EXISTS downloaded_quizzes;
    DROP TABLE IF EXISTS downloaded_questions;
    DROP TABLE IF EXISTS downloaded_options;
    DROP TABLE IF EXISTS pending_progress_events;
    DROP TABLE IF EXISTS pending_quiz_attempts;

    CREATE TABLE downloaded_courses (
      id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      downloaded_at TEXT NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE downloaded_modules (
      id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE downloaded_lessons (
      id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      body_text TEXT,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE downloaded_quizzes (
      id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      title TEXT NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE downloaded_questions (
      id TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      text TEXT NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE downloaded_options (
      id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      text TEXT NOT NULL,
      is_correct INTEGER NOT NULL,
      PRIMARY KEY (id, student_id)
    );

    CREATE TABLE pending_progress_events (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE pending_quiz_attempts (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_marks INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
  `);

  return db;
}
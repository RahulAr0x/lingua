import { createClient } from "@libsql/client";

let _client: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!_client) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
    }
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

export async function initDb() {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      duration INTEGER NOT NULL,
      content TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      analysis TEXT,
      score INTEGER
    );

    CREATE TABLE IF NOT EXISTS word_errors (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      word TEXT NOT NULL,
      error_type TEXT NOT NULL,
      context TEXT NOT NULL,
      suggestion TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS word_list (
      id TEXT PRIMARY KEY,
      word TEXT NOT NULL UNIQUE,
      error_count INTEGER NOT NULL DEFAULT 1,
      last_seen TEXT NOT NULL,
      mastered INTEGER NOT NULL DEFAULT 0,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS micro_lessons (
      id TEXT PRIMARY KEY,
      error_type TEXT NOT NULL,
      pattern TEXT NOT NULL,
      lesson_content TEXT NOT NULL,
      trigger_count INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      dismissed INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS variety_progress (
      variety TEXT NOT NULL,
      category TEXT NOT NULL,
      words_reviewed INTEGER NOT NULL DEFAULT 0,
      last_reviewed TEXT,
      PRIMARY KEY (variety, category)
    );

    CREATE TABLE IF NOT EXISTS pronunciation_progress (
      phoneme TEXT NOT NULL PRIMARY KEY,
      level TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      correct_attempts INTEGER NOT NULL DEFAULT 0,
      last_practiced TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_prompts (
      date_key TEXT NOT NULL PRIMARY KEY,
      prompt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reading_passages (
      id TEXT PRIMARY KEY,
      date_key TEXT NOT NULL,
      topic TEXT NOT NULL,
      title TEXT NOT NULL,
      passage TEXT NOT NULL,
      UNIQUE(date_key, topic)
    );
  `);
}

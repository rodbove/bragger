import { db } from "./connection.js";
import { logger } from "../utils/logger.js";

export function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      question_index INTEGER,
      question_text TEXT,
      answer TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'prompt',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_entries_date ON daily_entries(chat_id, date);

    CREATE TABLE IF NOT EXISTS daily_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      date TEXT NOT NULL UNIQUE,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS weekly_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(chat_id, week_start)
    );

    CREATE TABLE IF NOT EXISTS monthly_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(chat_id, year, month)
    );

    CREATE TABLE IF NOT EXISTS conversation_state (
      chat_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'idle',
      question_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (chat_id, date)
    );
  `);

  logger.info("Database schema initialized");
}

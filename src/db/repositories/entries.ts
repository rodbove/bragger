import { db } from "../connection.js";

export interface DailyEntry {
  id: number;
  chat_id: number;
  date: string;
  question_index: number | null;
  question_text: string | null;
  answer: string;
  source: string;
  created_at: string;
}

export function insertEntry(
  chatId: number,
  date: string,
  answer: string,
  source: "prompt" | "adhoc",
  questionIndex?: number,
  questionText?: string
): void {
  db.prepare(
    `INSERT INTO daily_entries (chat_id, date, question_index, question_text, answer, source)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(chatId, date, questionIndex ?? null, questionText ?? null, answer, source);
}

export function getEntriesForDate(chatId: number, date: string): DailyEntry[] {
  return db
    .prepare(`SELECT * FROM daily_entries WHERE chat_id = ? AND date = ? ORDER BY created_at`)
    .all(chatId, date) as DailyEntry[];
}

export function getEntriesForDateRange(
  chatId: number,
  startDate: string,
  endDate: string
): DailyEntry[] {
  return db
    .prepare(
      `SELECT * FROM daily_entries WHERE chat_id = ? AND date >= ? AND date <= ? ORDER BY date, created_at`
    )
    .all(chatId, startDate, endDate) as DailyEntry[];
}

export function getEntriesForMonth(
  chatId: number,
  year: number,
  month: number
): DailyEntry[] {
  const monthStr = String(month).padStart(2, "0");
  const startDate = `${year}-${monthStr}-01`;
  const endDate = `${year}-${monthStr}-31`;
  return getEntriesForDateRange(chatId, startDate, endDate);
}

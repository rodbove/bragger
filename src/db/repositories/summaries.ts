import { db } from "../connection.js";

export interface DailySummary {
  id: number;
  chat_id: number;
  date: string;
  summary: string;
  created_at: string;
}

export interface WeeklySummary {
  id: number;
  chat_id: number;
  week_start: string;
  week_end: string;
  summary: string;
  created_at: string;
}

export interface MonthlySummary {
  id: number;
  chat_id: number;
  year: number;
  month: number;
  summary: string;
  created_at: string;
}

export function upsertDailySummary(chatId: number, date: string, summary: string): void {
  db.prepare(
    `INSERT INTO daily_summaries (chat_id, date, summary)
     VALUES (?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET summary = excluded.summary`
  ).run(chatId, date, summary);
}

export function getDailySummary(chatId: number, date: string): DailySummary | undefined {
  return db
    .prepare(`SELECT * FROM daily_summaries WHERE chat_id = ? AND date = ?`)
    .get(chatId, date) as DailySummary | undefined;
}

export function getDailySummariesForRange(
  chatId: number,
  startDate: string,
  endDate: string
): DailySummary[] {
  return db
    .prepare(
      `SELECT * FROM daily_summaries WHERE chat_id = ? AND date >= ? AND date <= ? ORDER BY date`
    )
    .all(chatId, startDate, endDate) as DailySummary[];
}

export function upsertWeeklySummary(
  chatId: number,
  weekStart: string,
  weekEnd: string,
  summary: string
): void {
  db.prepare(
    `INSERT INTO weekly_summaries (chat_id, week_start, week_end, summary)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(chat_id, week_start) DO UPDATE SET summary = excluded.summary`
  ).run(chatId, weekStart, weekEnd, summary);
}

export function getWeeklySummary(
  chatId: number,
  weekStart: string
): WeeklySummary | undefined {
  return db
    .prepare(`SELECT * FROM weekly_summaries WHERE chat_id = ? AND week_start = ?`)
    .get(chatId, weekStart) as WeeklySummary | undefined;
}

export function getWeeklySummariesForMonth(
  chatId: number,
  year: number,
  month: number
): WeeklySummary[] {
  const monthStr = String(month).padStart(2, "0");
  const startDate = `${year}-${monthStr}-01`;
  const endDate = `${year}-${monthStr}-31`;
  return db
    .prepare(
      `SELECT * FROM weekly_summaries WHERE chat_id = ? AND week_start >= ? AND week_start <= ? ORDER BY week_start`
    )
    .all(chatId, startDate, endDate) as WeeklySummary[];
}

export function upsertMonthlySummary(
  chatId: number,
  year: number,
  month: number,
  summary: string
): void {
  db.prepare(
    `INSERT INTO monthly_summaries (chat_id, year, month, summary)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(chat_id, year, month) DO UPDATE SET summary = excluded.summary`
  ).run(chatId, year, month, summary);
}

export function getMonthlySummary(
  chatId: number,
  year: number,
  month: number
): MonthlySummary | undefined {
  return db
    .prepare(`SELECT * FROM monthly_summaries WHERE chat_id = ? AND year = ? AND month = ?`)
    .get(chatId, year, month) as MonthlySummary | undefined;
}

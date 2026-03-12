import { mkdirSync, writeFileSync } from "fs";
import { db } from "../db/connection.js";
import { DailySummary, WeeklySummary, MonthlySummary } from "../db/repositories/summaries.js";
import { monthName } from "../utils/dates.js";
import { logger } from "../utils/logger.js";

const DOCS_DIR = "docs";

export function exportAllMarkdown(chatId: number): string[] {
  mkdirSync(DOCS_DIR, { recursive: true });
  const files: string[] = [];

  // Export monthly summaries
  const monthlies = db
    .prepare(`SELECT * FROM monthly_summaries WHERE chat_id = ? ORDER BY year, month`)
    .all(chatId) as MonthlySummary[];

  for (const m of monthlies) {
    const filename = `${DOCS_DIR}/${m.year}-${String(m.month).padStart(2, "0")}-monthly.md`;
    const content = `# ${monthName(m.month)} ${m.year} — Brag Document\n\n${m.summary}\n`;
    writeFileSync(filename, content);
    files.push(filename);
  }

  // Export weekly summaries
  const weeklies = db
    .prepare(`SELECT * FROM weekly_summaries WHERE chat_id = ? ORDER BY week_start`)
    .all(chatId) as WeeklySummary[];

  for (const w of weeklies) {
    const filename = `${DOCS_DIR}/${w.week_start}-weekly.md`;
    const content = `# Weekly Summary — ${w.week_start} to ${w.week_end}\n\n${w.summary}\n`;
    writeFileSync(filename, content);
    files.push(filename);
  }

  // Export daily summaries
  const dailies = db
    .prepare(`SELECT * FROM daily_summaries WHERE chat_id = ? ORDER BY date`)
    .all(chatId) as DailySummary[];

  for (const d of dailies) {
    const filename = `${DOCS_DIR}/${d.date}-daily.md`;
    const content = `# Daily Summary — ${d.date}\n\n${d.summary}\n`;
    writeFileSync(filename, content);
    files.push(filename);
  }

  logger.info(`Exported ${files.length} markdown files to ${DOCS_DIR}/`);
  return files;
}

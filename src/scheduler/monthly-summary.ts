import { Bot } from "grammy";
import {
  getWeeklySummariesForMonth,
  upsertMonthlySummary,
} from "../db/repositories/summaries.js";
import { getEntriesForMonth } from "../db/repositories/entries.js";
import { generateMonthlySummary } from "../ai/monthly-summary.js";
import { previousMonth, monthName } from "../utils/dates.js";
import { logger } from "../utils/logger.js";

export async function sendMonthlySummary(
  bot: Bot,
  chatId: number
): Promise<void> {
  const { year, month } = previousMonth();

  const weeklySummaries = getWeeklySummariesForMonth(chatId, year, month);
  const entries = getEntriesForMonth(chatId, year, month);

  if (weeklySummaries.length === 0 && entries.length === 0) {
    logger.info(`No data for ${monthName(month)} ${year}, skipping monthly summary`);
    return;
  }

  try {
    const summary = await generateMonthlySummary(year, month, weeklySummaries, entries);
    upsertMonthlySummary(chatId, year, month, summary);

    await bot.api.sendMessage(
      chatId,
      `🏆 *${monthName(month)} ${year} — Brag Document*\n\n${summary}`,
      { parse_mode: "Markdown" }
    );

    logger.info(`Monthly summary sent for ${monthName(month)} ${year}`);
  } catch (err) {
    logger.error("Failed to generate monthly summary", err);
  }
}

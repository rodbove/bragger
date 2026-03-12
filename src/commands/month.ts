import { Context } from "grammy";
import {
  getMonthlySummary,
  getWeeklySummariesForMonth,
  upsertMonthlySummary,
} from "../db/repositories/summaries.js";
import { getEntriesForMonth } from "../db/repositories/entries.js";
import { generateMonthlySummary } from "../ai/monthly-summary.js";
import { monthName, previousMonth } from "../utils/dates.js";
import { logger } from "../utils/logger.js";

export async function monthCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const text = ctx.message?.text ?? "";
  const args = text.replace(/^\/month\s*/, "").trim().split(/\s+/);

  let year: number;
  let month: number;

  if (args[0]) {
    month = parseInt(args[0], 10);
    year = args[1] ? parseInt(args[1], 10) : new Date().getFullYear();
  } else {
    const prev = previousMonth();
    year = prev.year;
    month = prev.month;
  }

  let summary = getMonthlySummary(chatId, year, month);

  if (!summary) {
    const weeklySummaries = getWeeklySummariesForMonth(chatId, year, month);
    const entries = getEntriesForMonth(chatId, year, month);

    if (weeklySummaries.length === 0 && entries.length === 0) {
      await ctx.reply(`No data found for ${monthName(month)} ${year}.`);
      return;
    }

    await ctx.reply("Generating monthly brag document...");
    try {
      const summaryText = await generateMonthlySummary(year, month, weeklySummaries, entries);
      upsertMonthlySummary(chatId, year, month, summaryText);
      summary = {
        id: 0,
        chat_id: chatId,
        year,
        month,
        summary: summaryText,
        created_at: "",
      };
    } catch (err) {
      logger.error("Failed to generate monthly summary", err);
      await ctx.reply("Failed to generate monthly summary.");
      return;
    }
  }

  await ctx.reply(
    `🏆 *${monthName(month)} ${year} — Brag Document*\n\n${summary.summary}`,
    { parse_mode: "Markdown" }
  );
}

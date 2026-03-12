import { Context } from "grammy";
import { getWeeklySummary, getDailySummariesForRange, upsertWeeklySummary } from "../db/repositories/summaries.js";
import { getEntriesForDateRange } from "../db/repositories/entries.js";
import { generateWeeklySummary } from "../ai/weekly-summary.js";
import { getMonday, getFriday } from "../utils/dates.js";
import { logger } from "../utils/logger.js";

export async function weekCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const text = ctx.message?.text ?? "";
  const arg = text.replace(/^\/week\s*/, "").trim();
  const refDate = arg ? new Date(arg) : new Date();

  const weekStart = getMonday(refDate);
  const weekEnd = getFriday(refDate);

  let summary = getWeeklySummary(chatId, weekStart);

  if (!summary) {
    const dailySummaries = getDailySummariesForRange(chatId, weekStart, weekEnd);
    const entries = getEntriesForDateRange(chatId, weekStart, weekEnd);
    const adhocEntries = entries.filter((e) => e.source === "adhoc");

    if (dailySummaries.length === 0 && entries.length === 0) {
      await ctx.reply(`No data found for week of ${weekStart}.`);
      return;
    }

    await ctx.reply("Generating weekly summary...");
    try {
      const summaryText = await generateWeeklySummary(weekStart, weekEnd, dailySummaries, adhocEntries);
      upsertWeeklySummary(chatId, weekStart, weekEnd, summaryText);
      summary = { id: 0, chat_id: chatId, week_start: weekStart, week_end: weekEnd, summary: summaryText, created_at: "" };
    } catch (err) {
      logger.error("Failed to generate weekly summary", err);
      await ctx.reply("Failed to generate weekly summary.");
      return;
    }
  }

  await ctx.reply(`📊 *Weekly Summary — ${weekStart} to ${weekEnd}*\n\n${summary.summary}`, {
    parse_mode: "Markdown",
  });
}

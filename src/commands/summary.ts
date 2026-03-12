import { Context } from "grammy";
import { getDailySummary } from "../db/repositories/summaries.js";
import { getEntriesForDate } from "../db/repositories/entries.js";
import { generateDailySummary } from "../ai/daily-summary.js";
import { upsertDailySummary } from "../db/repositories/summaries.js";
import { todayStr } from "../utils/dates.js";
import { logger } from "../utils/logger.js";

export async function summaryCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const text = ctx.message?.text ?? "";
  const arg = text.replace(/^\/summary\s*/, "").trim();
  const date = arg || todayStr();

  // Check for existing summary
  let summary = getDailySummary(chatId, date);

  if (!summary) {
    // Try to generate one
    const entries = getEntriesForDate(chatId, date);
    if (entries.length === 0) {
      await ctx.reply(`No entries found for ${date}.`);
      return;
    }

    await ctx.reply("No summary yet — generating one now...");
    try {
      const text = await generateDailySummary(date, entries);
      upsertDailySummary(chatId, date, text);
      summary = { id: 0, chat_id: chatId, date, summary: text, created_at: "" };
    } catch (err) {
      logger.error("Failed to generate summary", err);
      await ctx.reply("Failed to generate summary.");
      return;
    }
  }

  await ctx.reply(`📋 *Daily Summary — ${date}*\n\n${summary.summary}`, {
    parse_mode: "Markdown",
  });
}

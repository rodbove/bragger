import { Bot } from "grammy";
import { questions } from "../conversation/questions.js";
import {
  getConversationState,
  upsertConversationState,
} from "../db/repositories/conversation.js";
import {
  getDailySummariesForRange,
  upsertWeeklySummary,
} from "../db/repositories/summaries.js";
import { getEntriesForDateRange } from "../db/repositories/entries.js";
import { generateWeeklySummary } from "../ai/weekly-summary.js";
import { todayStr, getMonday, getFriday } from "../utils/dates.js";
import { logger } from "../utils/logger.js";
import { Context } from "grammy";

export function sendDailyPrompt(bot: Bot, chatId: number): void {
  const date = todayStr();
  const existing = getConversationState(chatId, date);

  if (existing && (existing.state === "prompted" || existing.state === "skipped_day")) {
    logger.info(`Skipping daily prompt — already ${existing.state} for ${date}`);
    return;
  }

  upsertConversationState(chatId, date, "prompted", 0);

  bot.api
    .sendMessage(chatId, `🕕 Time to log your day!\n\n${questions[0].text}`)
    .catch((err) => logger.error("Failed to send daily prompt", err));

  logger.info(`Daily prompt sent to ${chatId} for ${date}`);
}

export function sendDailyReminder(bot: Bot, chatId: number): void {
  const date = todayStr();
  const state = getConversationState(chatId, date);

  if (!state || state.state !== "prompted" || state.question_index !== 0) {
    return;
  }

  bot.api
    .sendMessage(
      chatId,
      `⏰ Reminder: You haven't started logging today yet!\n\n${questions[0].text}\n\n(Send "skip" to skip today)`
    )
    .catch((err) => logger.error("Failed to send reminder", err));

  logger.info(`Daily reminder sent to ${chatId}`);
}

export async function triggerWeeklySummary(
  ctx: Context,
  chatId: number
): Promise<void> {
  const now = new Date();
  const weekStart = getMonday(now);
  const weekEnd = getFriday(now);

  const dailySummaries = getDailySummariesForRange(chatId, weekStart, weekEnd);
  const entries = getEntriesForDateRange(chatId, weekStart, weekEnd);
  const adhocEntries = entries.filter((e) => e.source === "adhoc");

  if (dailySummaries.length === 0) {
    logger.info("No daily summaries this week, skipping weekly summary");
    return;
  }

  try {
    await ctx.reply("It's Friday! Generating your weekly summary...");
    const summary = await generateWeeklySummary(
      weekStart,
      weekEnd,
      dailySummaries,
      adhocEntries
    );
    upsertWeeklySummary(chatId, weekStart, weekEnd, summary);
    await ctx.reply(`📊 *Weekly Summary — ${weekStart} to ${weekEnd}*\n\n${summary}`, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    logger.error("Failed to generate weekly summary", err);
    await ctx.reply("Failed to generate weekly summary. Your daily entries are safe.");
  }
}

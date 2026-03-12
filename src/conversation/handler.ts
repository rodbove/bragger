import { Context } from "grammy";
import { questions, TOTAL_QUESTIONS } from "./questions.js";
import { transition, State } from "./state-machine.js";
import {
  getConversationState,
  upsertConversationState,
} from "../db/repositories/conversation.js";
import { insertEntry, getEntriesForDate } from "../db/repositories/entries.js";
import { upsertDailySummary } from "../db/repositories/summaries.js";
import { generateDailySummary } from "../ai/daily-summary.js";
import { todayStr, isFriday } from "../utils/dates.js";
import { triggerWeeklySummary } from "../scheduler/daily-prompt.js";
import { logger } from "../utils/logger.js";

function dbStateToState(
  dbState: { state: string; question_index: number } | undefined
): State {
  if (!dbState) return { state: "idle", questionIndex: 0 };
  return {
    state: dbState.state as State["state"],
    questionIndex: dbState.question_index,
  };
}

export async function handleMessage(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  const text = ctx.message?.text;
  if (!chatId || !text) return;

  // Ignore commands (handled separately)
  if (text.startsWith("/")) return;

  const date = todayStr();
  const dbState = getConversationState(chatId, date);
  const current = dbStateToState(dbState);

  if (current.state !== "prompted") return;

  const { newState, action } = transition(current, text);

  switch (action) {
    case "save_and_advance": {
      const q = questions[current.questionIndex];
      insertEntry(chatId, date, text, "prompt", q.index, q.text);

      upsertConversationState(chatId, date, newState.state, newState.questionIndex);

      if (newState.questionIndex < TOTAL_QUESTIONS) {
        await ctx.reply(questions[newState.questionIndex].text);
      } else {
        await completeDailySummary(ctx, chatId, date);
      }
      break;
    }

    case "skip_question": {
      upsertConversationState(chatId, date, newState.state, newState.questionIndex);

      if (newState.questionIndex < TOTAL_QUESTIONS) {
        await ctx.reply(`Skipped. ${questions[newState.questionIndex].text}`);
      } else {
        await completeDailySummary(ctx, chatId, date);
      }
      break;
    }

    case "skip_day":
      upsertConversationState(chatId, date, "skipped_day", current.questionIndex);
      await ctx.reply("Got it, skipping today. Rest up! 💤");
      break;

    case "complete":
      await completeDailySummary(ctx, chatId, date);
      break;

    default:
      break;
  }
}

async function completeDailySummary(
  ctx: Context,
  chatId: number,
  date: string
): Promise<void> {
  const entries = getEntriesForDate(chatId, date);
  if (entries.length === 0) {
    await ctx.reply("No entries for today — nothing to summarize.");
    return;
  }

  await ctx.reply("All done! Generating your daily summary...");

  try {
    const summary = await generateDailySummary(date, entries);
    upsertDailySummary(chatId, date, summary);
    await ctx.reply(`📋 *Daily Summary — ${date}*\n\n${summary}`, {
      parse_mode: "Markdown",
    });

    if (isFriday()) {
      await triggerWeeklySummary(ctx, chatId);
    }
  } catch (err) {
    logger.error("Failed to generate daily summary", err);
    await ctx.reply("Sorry, failed to generate the summary. Your entries are saved though!");
  }
}

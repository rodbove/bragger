import { Context } from "grammy";
import { upsertConversationState } from "../db/repositories/conversation.js";
import { todayStr } from "../utils/dates.js";

export async function skipCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const date = todayStr();
  upsertConversationState(chatId, date, "skipped_day", 0);
  await ctx.reply("Skipping today's prompts. Rest up! 💤");
}

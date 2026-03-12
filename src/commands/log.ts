import { Context } from "grammy";
import { insertEntry } from "../db/repositories/entries.js";
import { todayStr } from "../utils/dates.js";

export async function logCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const text = ctx.message?.text;
  if (!text) return;

  const entry = text.replace(/^\/log\s*/, "").trim();
  if (!entry) {
    await ctx.reply("Usage: /log <your accomplishment>");
    return;
  }

  const date = todayStr();
  insertEntry(chatId, date, entry, "adhoc");
  await ctx.reply(`✅ Logged for ${date}`);
}

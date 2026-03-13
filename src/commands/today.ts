import { Context } from "grammy";
import { getEntriesForDate } from "../db/repositories/entries.js";
import { todayStr } from "../utils/dates.js";

export async function todayCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const date = todayStr();
  const entries = getEntriesForDate(chatId, date);

  if (entries.length === 0) {
    await ctx.reply("No entries for today yet.");
    return;
  }

  const lines = entries.map((e) => {
    const source = e.source === "adhoc" ? "[ad-hoc]" : `[Q${(e.question_index ?? 0) + 1}]`;
    return `#${e.id} ${source} ${e.answer}`;
  });

  await ctx.reply(`📝 *Entries for ${date}*\n\n${lines.join("\n")}`, {
    parse_mode: "Markdown",
  });
}

import { Context } from "grammy";
import { getEntryById, deleteEntry } from "../db/repositories/entries.js";

export async function deleteCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const text = ctx.message?.text ?? "";
  const arg = text.replace(/^\/delete\s*/, "").trim();
  const id = Number(arg);

  if (!arg || isNaN(id)) {
    await ctx.reply("Usage: /delete <id>\n\nUse /today to see entry IDs.");
    return;
  }

  const entry = getEntryById(id, chatId);
  if (!entry) {
    await ctx.reply(`Entry #${id} not found.`);
    return;
  }

  deleteEntry(id, chatId);
  await ctx.reply(`🗑️ Entry #${id} deleted.`);
}

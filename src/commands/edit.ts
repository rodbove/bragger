import { Context } from "grammy";
import { getEntryById, updateEntry } from "../db/repositories/entries.js";

export async function editCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const text = ctx.message?.text ?? "";
  const arg = text.replace(/^\/edit\s*/, "").trim();

  const spaceIndex = arg.indexOf(" ");
  if (!arg || spaceIndex === -1) {
    await ctx.reply("Usage: /edit <id> <new text>\n\nUse /today to see entry IDs.");
    return;
  }

  const id = Number(arg.slice(0, spaceIndex));
  const newText = arg.slice(spaceIndex + 1).trim();

  if (isNaN(id) || !newText) {
    await ctx.reply("Usage: /edit <id> <new text>");
    return;
  }

  const entry = getEntryById(id, chatId);
  if (!entry) {
    await ctx.reply(`Entry #${id} not found.`);
    return;
  }

  updateEntry(id, chatId, newText);
  await ctx.reply(`✏️ Entry #${id} updated.`);
}

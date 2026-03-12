import { Context } from "grammy";
import { exportAllMarkdown } from "../export/markdown.js";

export async function exportCommand(ctx: Context): Promise<void> {
  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const files = exportAllMarkdown(chatId);

  if (files.length === 0) {
    await ctx.reply("No summaries to export yet.");
    return;
  }

  await ctx.reply(`📁 Exported ${files.length} files to docs/\n\n${files.join("\n")}`);
}

import { Context } from "grammy";

export async function startCommand(ctx: Context): Promise<void> {
  await ctx.reply(
    `👋 Welcome to Bragger!\n\n` +
      `I'll help you track your daily work accomplishments and generate polished summaries.\n\n` +
      `*Commands:*\n` +
      `/log <text> — Quick ad-hoc entry\n` +
      `/today — Show today's entries\n` +
      `/edit <id> <text> — Edit an entry\n` +
      `/delete <id> — Delete an entry\n` +
      `/summary [date] — Show daily summary\n` +
      `/week [date] — Show weekly summary\n` +
      `/month [month] [year] — Show monthly summary\n` +
      `/export — Export all summaries to markdown\n` +
      `/skip — Skip today's prompts\n\n` +
      `I'll prompt you with 5 questions each weekday. Answer normally, send "-" to skip a question, or "skip" to skip the whole day.`,
    { parse_mode: "Markdown" }
  );
}

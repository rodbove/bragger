import { Bot } from "grammy";
import { config } from "./config.js";
import { logger } from "./utils/logger.js";

export const bot = new Bot(config.telegramBotToken);

// Auth middleware — only allow configured user
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;
  if (userId !== config.allowedUserId) {
    logger.warn(`Unauthorized access attempt from user ${userId}`);
    await ctx.reply("Sorry, this bot is private.");
    return;
  }
  await next();
});

logger.info("Bot created with auth middleware");
